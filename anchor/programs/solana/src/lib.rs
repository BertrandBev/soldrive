use anchor_lang::prelude::*;

declare_id!("5QEzcF7HPx6z3oN4Fu8cqxGr99oUEGS4uE4MrazyjstF");

fn timestamp() -> i64 {
    let clock: Clock = Clock::get().unwrap();
    clock.unix_timestamp
}

fn copy_content(file: &mut AccountInfo, content: &Vec<u8>) -> Result<()> {
    let mut data = file.try_borrow_mut_data()?;
    let data: &mut [u8] = &mut data;
    let min_idx = File::size(0);
    let idx_start = data.len() - content.len();
    require!(idx_start >= min_idx, ErrorCode::DataSizeExceeded);
    (&mut data[idx_start..]).copy_from_slice(&content[..]);
    Ok(())
}

#[program]
pub mod soldrive {
    use super::*;

    pub fn sign(_ctx: Context<Sign>) -> Result<()> {
        // Dummy function call to obtain encryption key
        Ok(())
    }

    pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
        let user = &mut ctx.accounts.user;
        user.created_at = timestamp();
        user.file_id = 0;
        user.folder_id = 0;
        user.file_count = 0;
        user.folder_count = 0;
        user.space_used = 0;
        user.encryption = true;
        Ok(())
    }

    pub fn create_folder(ctx: Context<CreateFolder>, parent: u32, name: Vec<u8>) -> Result<()> {
        // Check args
        require!(name.len() <= Folder::NAME_MAX_LEN, ErrorCode::StringTooLong);
        let user = &mut ctx.accounts.user;
        let folder = &mut ctx.accounts.folder;
        require!(user.folder_id < u32::MAX, ErrorCode::FolderCountExceeded);

        // Bump folder id & count
        user.folder_id += 1;
        user.folder_count += 1;

        // Init folder
        folder.owner = *ctx.accounts.authority.key;
        folder.id = user.folder_id;
        folder.created_at = timestamp();
        folder.name = name;
        folder.parent = parent;
        Ok(())
    }

    pub fn update_folder(
        ctx: Context<UpdateFolder>,
        _id: u32,
        parent: Option<u32>,
        name: Option<Vec<u8>>,
    ) -> Result<()> {
        // Check args
        let folder = &mut ctx.accounts.folder;
        if let Some(parent) = parent {
            folder.parent = parent;
        }
        if let Some(name) = name {
            require!(name.len() <= Folder::NAME_MAX_LEN, ErrorCode::StringTooLong);
            folder.name = name;
        }
        Ok(())
    }

    pub fn remove_folder(ctx: Context<RemoveFolder>, _id: u32) -> Result<()> {
        let user = &mut ctx.accounts.user;
        user.folder_count -= 1;
        Ok(())
    }

    pub fn create_file(
        ctx: Context<CreateFile>,
        max_size: u32,
        parent: u32,
        name: Vec<u8>,
        file_ext: String,
        file_size: u64,
        access: Access,
        backend: Backend,
        content: Vec<u8>,
    ) -> Result<()> {
        // Check args
        require!(name.len() <= File::NAME_MAX_LEN, ErrorCode::StringTooLong);
        require!(
            file_ext.len() <= File::EXT_MAX_LEN,
            ErrorCode::StringTooLong
        );
        let user = &mut ctx.accounts.user;
        let file = &mut ctx.accounts.file;
        require!(user.folder_id < u32::MAX, ErrorCode::FileCountExceeded);

        // Bump count
        user.file_id += 1;
        user.file_count += 1;
        user.space_used += max_size;

        // Init file
        file.owner = *ctx.accounts.authority.key;
        file.id = user.file_id;
        file.created_at = timestamp();
        file.size = content.len() as u32;
        file.max_size = max_size;
        file.parent = parent;
        file.name = name;
        file.file_ext = file_ext;
        file.file_size = file_size;
        file.access = access;
        file.backend = backend;

        // Copy content over
        let mut info = file.to_account_info();
        copy_content(&mut info, &content)?;

        Ok(())
    }

    pub fn update_file(
        ctx: Context<UpdateFile>,
        _id: u32,
        parent: Option<u32>,
        name: Option<Vec<u8>>,
        file_ext: Option<String>,
        file_size: Option<u64>,
        access: Option<Access>,
        backend: Option<Backend>,
        content: Option<Vec<u8>>,
    ) -> Result<()> {
        // Check args
        let file = &mut ctx.accounts.file;
        // Update file
        if let Some(parent) = parent {
            file.parent = parent;
        }
        if let Some(name) = name {
            require!(name.len() <= File::NAME_MAX_LEN, ErrorCode::StringTooLong);
            file.name = name;
        }
        if let Some(file_ext) = file_ext {
            require!(
                file_ext.len() <= File::EXT_MAX_LEN,
                ErrorCode::StringTooLong
            );
            file.file_ext = file_ext;
        }
        if let Some(file_size) = file_size {
            file.file_size = file_size;
        }
        if let Some(access) = access {
            file.access = access;
        }
        if let Some(backend) = backend {
            file.backend = backend;
        }
        if let Some(content) = content {
            file.size = content.len() as u32;
            let mut info = file.to_account_info();
            copy_content(&mut info, &content)?;
        }
        Ok(())
    }

    pub fn remove_file(ctx: Context<RemoveFile>, _id: u32) -> Result<()> {
        let file = &mut ctx.accounts.file;
        let user = &mut ctx.accounts.user;
        user.file_count -= 1;

        // Reduce used space
        let info = file.to_account_info();
        let data = info.try_borrow_data()?;
        let max_size = data.len() - File::size(0);
        user.space_used -= max_size as u32;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Sign<'info> {
    #[account()]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(
        init, payer = authority,
        space = User::SIZE,
        seeds = [b"user".as_ref(), authority.key.as_ref()],
        bump)]
    pub user: Account<'info, User>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateFolder<'info> {
    #[account(
        init, payer = authority,
        space = Folder::SIZE,
        seeds = [b"folder".as_ref(), authority.key.as_ref(), &u32::to_le_bytes(user.folder_id + 1)],
        bump)]
    pub folder: Account<'info, Folder>,
    #[account(mut,
        seeds = [b"user".as_ref(), authority.key.as_ref()],
        bump)]
    pub user: Account<'info, User>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(_id: u32)]
pub struct UpdateFolder<'info> {
    #[account(mut,
        seeds = [b"folder".as_ref(), authority.key.as_ref(), &u32::to_le_bytes(_id)],
        bump)]
    pub folder: Account<'info, Folder>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(_id: u32)]
pub struct RemoveFolder<'info> {
    #[account(mut,
        seeds = [b"folder".as_ref(), authority.key.as_ref(), &u32::to_le_bytes(_id)],
        bump,
        close=authority)]
    pub folder: Account<'info, Folder>,
    #[account(mut,
        seeds = [b"user".as_ref(), authority.key.as_ref()],
        bump)]
    pub user: Account<'info, User>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(max_size: u32)]
pub struct CreateFile<'info> {
    #[account(
        init, payer = authority,
        space = File::size(max_size),
        seeds = [b"file".as_ref(), authority.key.as_ref(), &u32::to_le_bytes(user.file_id + 1)],
        bump)]
    pub file: Account<'info, File>,
    #[account(mut,
        seeds = [b"user".as_ref(), authority.key.as_ref()],
        bump)]
    pub user: Account<'info, User>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(_id: u32)]
pub struct UpdateFile<'info> {
    #[account(mut,
        seeds = [b"file".as_ref(), authority.key.as_ref(), &u32::to_le_bytes(_id)],
        bump)]
    pub file: Account<'info, File>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(_id: u32)]
pub struct RemoveFile<'info> {
    #[account(mut,
        seeds = [b"file".as_ref(), authority.key.as_ref(), &u32::to_le_bytes(_id)],
        bump,
        close=authority)]
    pub file: Account<'info, File>,
    #[account(mut,
        seeds = [b"user".as_ref(), authority.key.as_ref()],
        bump)]
    pub user: Account<'info, User>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

// Accounts
// --------

#[account]
pub struct User {
    pub created_at: i64,
    pub folder_id: u32,
    pub file_id: u32,
    pub folder_count: u32,
    pub file_count: u32,
    pub space_used: u32,
    pub encryption: bool,
}

impl User {
    const PADDING: usize = 48;
    const SIZE: usize = 8 // discriminator
        + 8  // created_at
        + 4  // folder_id
        + 4  // file_id
        + 4  // folder_count
        + 4  // file_count
        + 4  // space_used
        + 1  // encryption
        + User::PADDING; // padding
}

#[account]
pub struct Folder {
    pub owner: Pubkey,
    pub id: u32, // 1 indexed
    pub created_at: i64,
    pub parent: u32,
    pub name: Vec<u8>,
}

impl Folder {
    const PADDING: usize = 48;
    const NAME_MAX_LEN: usize = 64;

    const SIZE: usize = 8 // discriminator
        + 32 // owner
        + 4 // id
        + 8 // created_at
        + 4 // parent
        + 4 + 4 * Folder::NAME_MAX_LEN
        + Folder::PADDING;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub enum Backend {
    Solana,
    Arweave,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub enum Access {
    Private,
    PublicRead,
    PublicReadWrite,
}

#[account]
pub struct File {
    pub owner: Pubkey,
    pub id: u32,
    pub created_at: i64,
    pub parent: u32,
    pub name: Vec<u8>,
    pub file_ext: String,
    pub file_size: u64,
    pub access: Access,
    pub backend: Backend,
    pub size: u32,
    pub max_size: u32,
    // pub content: String, omitted for deserialization purposes
}

pub struct FileEncoder {
    pub content: String,
}

impl File {
    const PADDING: usize = 48;
    const NAME_MAX_LEN: usize = 64;
    const EXT_MAX_LEN: usize = 4;

    fn size(byte_count: u32) -> usize {
        8                                 // discriminator
        + 32                              // owner
        + 4                               // id
        + 8                               // created_at
        + 4                               // parent
        + 4 + File::NAME_MAX_LEN          // name
        + 4 + File::EXT_MAX_LEN           // file_ext
        + 8                               // file_size
        + std::mem::size_of::<Access>()   // access
        + std::mem::size_of::<Backend>()  // backend
        + 4                               // size
        + 4                               // max_size
        + File::PADDING                   // padding
        + byte_count as usize // content
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("String too long")]
    StringTooLong,
    #[msg("Folder count exceeded")]
    FolderCountExceeded,
    #[msg("File count exceeded")]
    FileCountExceeded,
    #[msg("Data size exceeded")]
    DataSizeExceeded,
}
