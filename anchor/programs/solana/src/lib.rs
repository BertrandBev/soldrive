use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

fn timestamp() -> i64 {
    let clock: Clock = Clock::get().unwrap();
    clock.unix_timestamp
}

#[program]
pub mod soldrive {
    use super::*;

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

    pub fn create_folder(ctx: Context<CreateFolder>, parent: u32, name: String) -> Result<()> {
        // Check args
        require!(name.len() <= Folder::NAME_MAX_LEN, ErrorCode::StringTooLong);
        let user = &mut ctx.accounts.user;
        let folder = &mut ctx.accounts.folder;
        require!(user.folder_id < u32::MAX, ErrorCode::FolderCountExceeded);

        // Bump folder id & count
        user.folder_id += 1;
        user.folder_count += 1;

        // Init folder
        folder.id = user.folder_id;
        folder.created_at = timestamp();
        folder.name = name;
        folder.parent = parent;
        Ok(())
    }

    pub fn update_folder(
        ctx: Context<UpdateFolder>,
        _id: u32,
        parent: u32,
        name: String,
    ) -> Result<()> {
        // Check args
        require!(name.len() <= Folder::NAME_MAX_LEN, ErrorCode::StringTooLong);
        let folder = &mut ctx.accounts.folder;
        folder.name = name;
        folder.parent = parent;
        Ok(())
    }

    pub fn remove_folder(ctx: Context<RemoveFolder>, _id: u32) -> Result<()> {
        let user = &mut ctx.accounts.user;
        user.folder_count -= 1;
        Ok(())
    }

    pub fn create_file(
        ctx: Context<CreateFile>,
        parent: u32,
        size: u32,
        access: Access,
        file_type: FileType,
        content: String,
    ) -> Result<()> {
        // Check args
        require!(
            content.len() <= Folder::NAME_MAX_LEN,
            ErrorCode::StringTooLong
        );
        let user = &mut ctx.accounts.user;
        let file = &mut ctx.accounts.file;
        require!(user.folder_id < u32::MAX, ErrorCode::FileCountExceeded);

        // Bump count
        user.file_id += 1;
        user.file_count += 1;
        user.space_used += size;

        // Check args
        // require!(name.len() <= File::NAME_MAX_LEN, ErrorCode::StringTooLong);
        file.id = user.file_id;
        file.created_at = timestamp();
        file.size = size;
        file.parent = parent;
        file.access = access;
        file.file_type = file_type;

        // TODO: Copy content

        Ok(())
    }

    pub fn update_file(
        ctx: Context<UpdateFile>,
        _id: u32,
        parent: Option<u32>,
        access: Option<Access>,
        content: Option<String>,
    ) -> Result<()> {
        // Check args
        let user = &mut ctx.accounts.user;
        let file = &mut ctx.accounts.file;
        // Update file
        if let Some(parent) = parent {
            file.parent = parent;
        }
        if let Some(access) = access {
            file.access = access;
        }
        if let Some(content) = content {
            // TODO: Copy content
        }
        Ok(())
    }

    pub fn remove_file(ctx: Context<RemoveFile>, _id: u32) -> Result<()> {
        let file = &mut ctx.accounts.file;
        let user = &mut ctx.accounts.user;
        user.file_count -= 1;
        user.space_used -= file.size;
        Ok(())
    }
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
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(_parent: u32, size: u32)]
pub struct CreateFile<'info> {
    #[account(
        init, payer = authority,
        space = File::size(size),
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
    #[account(mut,
        seeds = [b"user".as_ref(), authority.key.as_ref()],
        bump)]
    pub user: Account<'info, User>,
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
    const PADDING: usize = 64;
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
    pub id: u32, // 1 indexed
    pub created_at: i64,
    pub parent: u32,
    pub name: String,
}

impl Folder {
    const PADDING: usize = 64;
    const NAME_MAX_LEN: usize = 32;

    const SIZE: usize = 8 // discriminator
        + 4 // id
        + 8 // created_at
        + 4 // parent
        + 4 + 4 * Folder::NAME_MAX_LEN
        + Folder::PADDING;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub enum FileType {
    File,
    Note,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub enum Access {
    Private,
    PublicRead,
    PublicReadWrite,
}

#[account]
pub struct File {
    pub id: u32,
    pub created_at: i64,
    pub parent: u32,
    pub file_type: FileType,
    pub access: Access,
    pub size: u32,
    // pub content: String, omitted for deserialization purposes
}

impl File {
    const PADDING: usize = 64;

    fn size(char_count: u32) -> usize {
        8                                 // discriminator
        + 4                               // id
        + 8                               // created_at
        + 4                               // parent
        + std::mem::size_of::<FileType>() // file_type
        + std::mem::size_of::<Access>()   // access
        + 4                               // size
        + File::PADDING                   // padding
        + char_count as usize // content
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
}
