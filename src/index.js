import '../style.css'
import Preloader from './preloader'

let btn = undefined;
let progressEl = undefined

const loadStart = () => {
  const loader = new Preloader();
  loader.load(
    (loaded) => {
      console.log(`> load progress: ${Math.round(loaded * 100)}%`)
      progressEl.style.width = `${Math.round(loaded * 100)}%`
    },
    loadComplete,
  )
}

const loadComplete = (assets) => {
  console.log('> load complete!', assets)
  btn.innerHTML = 'Loaded!'
}

const onClick = () => {
  btn.removeEventListener('click', onClick)
  btn.innerHTML = 'Loading'
  btn.disabled = true
  loadStart()
}

window.onload = () => {
  progressEl = document.getElementById('progress')
  btn = document.querySelector('button')
  btn.addEventListener('click', onClick)
}
