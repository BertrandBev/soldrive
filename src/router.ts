import * as VueRouter from "vue-router";
import About from "./components/About.vue";
import Home from "./components/Home.vue";
import Account from "./components/Account.vue";
import EditFile from "./components/file/EditFile.vue";
import { useUserStore } from "./store/userStore";
import { watch } from "vue";

const { isLoggedIn } = useUserStore();

type NameLoader = (route: VueRouter.RouteLocationNormalizedLoaded) => string;
type Meta = {
  name: string | NameLoader;
  noLogin?: boolean;
  showLogo?: boolean;
  showBack?: boolean;
};

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: About,
      meta: {
        name: "Soldrive",
        noLogin: true,
        showLogo: true,
      } as Meta,
    },
    {
      path: "/explorer/:path(.*)*",
      component: Home,
      meta: { name: "SolDrive", showBack: true } as Meta,
      props: (route) => {
        return { ...route.query, ...route.params };
      },
    },
    {
      path: "/file",
      component: EditFile,
      props: (route) => route.query,
      meta: {
        name: (route: VueRouter.RouteLocationNormalizedLoaded) => {
          return !!route.query.id ? "Edit file" : "New file";
        },
        showBack: true,
      } as Meta,
    },
    {
      path: "/account",
      component: Account,
      meta: { name: "Account", showBack: true, a: 1 } as Meta,
    },
  ],
});

export function folderId(path: string[]) {
  if (path.length == 0) return 0;
  return parseInt(path[path.length - 1]) || 0;
}

export default router;
