import { defineStore } from "pinia";

export const mainStore = defineStore("main", {
  state: () => {
    return {
      imgLoadStatus: false, // 壁纸加载状态
      coverType: "0", // 壁纸种类
      backgroundShow: false, // 壁纸展示状态
    };
  },
  actions: {
    // 更改壁纸加载状态
    setImgLoadStatus(value) {
      this.imgLoadStatus = value;
    },
  },
  persist: {
    key: "homepage-data",
    storage: window.localStorage,
    paths: ["coverType"],
  },
});
