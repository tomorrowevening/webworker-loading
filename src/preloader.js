import { Texture } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// Add your own resources
/*
 {
   file: '/models/.gltf',
   type: 'gltf'
 }
*/
const assetList = [];

export const assets = {
  audio: new Map(),
  images: new Map(),
  json: new Map(),
  models: new Map(),
  textures: new Map(),
};

const draco = new DRACOLoader();
draco.setDecoderPath('/libs/draco/');

export default class Preloader {
  async createAssets(loaded) {
    return new Promise((resolve) => {
      console.log('Convert loaded assets to WebGL')
      const promises = []
      const startTime = Date.now()

      // Textures
      for (let [key, value] of loaded.textures) {
        const texture = new Texture(value)
        assets.textures.set(key, texture)
      }

      // Models
      for (let [key, value] of loaded.models) {
        const model = new GLTFLoader()
        model.setDRACOLoader(draco)
        promises.push(
          model.parseAsync(value, '').then((gltf) => {
            assets.models.set(key, gltf)
            console.log((Date.now() - startTime) / 1000, key)
          })
        )
      }

      Promise.all(promises).then(() => {
        console.log('Assets complete:', (Date.now() - startTime) / 1000)
        resolve(assets)
      })
    })
  }

  load(onProgress, onComplete) {
    console.log('Begin preload');
    // WebGL compression
    draco.preload()

    const worker = new Worker('worker.js');
    const onMessage = (event) => {
      const msg = event.data
      switch (msg.type) {
        case 'loadProgress':
          onProgress(msg.data)
          break
        case 'loadComplete':
          worker.removeEventListener('message', onMessage);
          worker.terminate();
          this.createAssets(msg.data).then(onComplete);
          break
      }
    }

    // Begin load
    worker.addEventListener('message', onMessage);
    worker.postMessage({
      type: 'loadStart',
      data: assetList,
    });
  }
}
