// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
import * as nodeCanvas from 'canvas';

import * as faceapi from 'face-api.js';

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
const { Canvas, Image, ImageData, loadImage } = nodeCanvas;
const canvas = new Canvas();
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

// ЗАГРУЗКА МОДЕЛЕЙ распознавания и определения
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromDisk('./models'),
  faceapi.nets.faceLandmark68Net.loadFromDisk('./models'),
  faceapi.nets.ssdMobilenetv1.loadFromDisk('./models')
]).then(start);

// После загрузки моделей запускаем колбэк
async function start() {
  
  // path to image
  // const path = './target/mrvl.jpg';
  // create instanse of canvas
  // const input = await nodeCanvas.loadImage(path);
  // take of descriptors
  // const results = await faceapi.detectAllFaces(input).withFaceLandmarks().withFaceDescriptors()

  // console.log(results);

  // FIRST TEST the similar

  const testImageOne = await nodeCanvas.loadImage('./test_1_1/1.jpg');
  const testImageTwo = await nodeCanvas.loadImage('./test_1_2/2.jpg');
  const testImageThree = await nodeCanvas.loadImage('./test_1_3/3.jpg');

  const resultOne = await faceapi.detectSingleFace(testImageOne).withFaceLandmarks().withFaceDescriptor();
  const resultTwo = await faceapi.detectSingleFace(testImageTwo).withFaceLandmarks().withFaceDescriptor();
  const resultThree = await faceapi.detectSingleFace(testImageThree).withFaceLandmarks().withFaceDescriptor();
    
  // console.log(resultOne);
  // console.log(resultTwo);

  // create Matcher
  const faceMatcher = new faceapi.FaceMatcher(resultOne);

  const bestMatch1 = faceMatcher.findBestMatch(resultTwo.descriptor)
  console.log(bestMatch1.toString())

  const bestMatch2 = faceMatcher.findBestMatch(resultThree.descriptor)
  console.log(bestMatch2.toString())
}
