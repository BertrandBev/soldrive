import * as VueRouter from "vue-router";
import Home from "./components/Home.vue";
import EditFile from "./components/file/EditFile.vue";
import Account from "./components/Account.vue";

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    { path: "/", redirect: "/explorer" },
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

export function folderId(path: string[]) {
  if (path.length == 0) return 0;
  return parseInt(path[path.length - 1]) || 0;
}

export default router;
