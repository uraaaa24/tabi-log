// react-native-svgはAndroidのタップ音だけにこのTurboModuleを使う。
// ブラウザにはないため、同じ形の何もしないモジュールを渡す。
const soundModule = { playTouchSound: () => undefined }

// oxlint-disable-next-line import/no-default-export -- 差し替え元のモジュールがdefault exportのため。
export default soundModule
