import * as VueRouter from "vue-router";
import About from "./components/About.vue";
import Home from "./components/Home.vue";
import Account from "./components/Account.vue";
import EditFile from "./components/file/EditFile.vue";
import { useUserStore } from "./store/userStore";

const { authState } = useUserStore();

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    { path: "/", component: About, meta: { name: "Soldrive", noLogin: true } },
    {
      path: "/explorer/:path(.*)*",
      component: Home,
      meta: { name: "SolDrive", hideBack: true },
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
      },
    },
    {
      path: "/account",
      component: Account,
      meta: { name: "Account" },
    },
  ],
});

router.beforeEach(async (to, from) => {
  // if (to.name !== "Login") {
  //   return { path: "/" };
  // }
});

export function folderId(path: string[]) {
  if (path.length == 0) return 0;
  return parseInt(path[path.length - 1]) || 0;
}

export default router;
