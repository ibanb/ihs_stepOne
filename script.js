// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
import * as nodeCanvas from 'canvas';
// import '@tensorflow/tfjs-node';
import * as faceapi from 'face-api.js';
import fs from 'fs';

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
const { Canvas, Image, ImageData, loadImage } = nodeCanvas;
const canvas = new Canvas();
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

// Fake DB
const db = [];

// ЗАГРУЗКА МОДЕЛЕЙ распознавания и определения
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromDisk('./models'),
  faceapi.nets.faceLandmark68Net.loadFromDisk('./models'),
  faceapi.nets.ssdMobilenetv1.loadFromDisk('./models')
])
.then(async () => {

  console.log('MODELS UPLOAD')

  // get paths
  const pathsToFotos = await fs.promises.readdir('./store');

  pathsToFotos.forEach(async (path) => {

    const image = await nodeCanvas.loadImage(`./store/${path}`);
    console.log(`image | ./store/${path} LOADED.`);
    const result = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
    console.log(`image | ./store/${path} DETECTED.`);
    db.push({
      path: `./store/${path}`,
      desc: result,
    });
    console.log(`image | ./store/${path} add to DB.`);
  });

  // const bestMatch1 = faceMatcher.findBestMatch(resultOne.descriptor);
  // console.log(bestMatch1.toString());

  // const bestMatch2 = faceMatcher.findBestMatch(resultTwo.descriptor);
  // console.log(bestMatch2.toString());

  // const bestMatch3 = faceMatcher.findBestMatch(resultThree.descriptor);
  // console.log(bestMatch3.toString());

})
.then(async () => {

  // LOAD target 
  const descriptions = [];

  const targetImage1 = await nodeCanvas.loadImage('./target/1.jpg');
  const targetImage2 = await nodeCanvas.loadImage('./target/2.jpg');
  const targetImage3 = await nodeCanvas.loadImage('./target/3.jpg');

  const targetOneDetections = await faceapi.detectSingleFace(targetImage1).withFaceLandmarks().withFaceDescriptor();
  const targetTwoDetections = await faceapi.detectSingleFace(targetImage2).withFaceLandmarks().withFaceDescriptor();
  const targetThreeDetections = await faceapi.detectSingleFace(targetImage3).withFaceLandmarks().withFaceDescriptor();

  descriptions.push(targetOneDetections.descriptor);
  descriptions.push(targetTwoDetections.descriptor);
  descriptions.push(targetThreeDetections.descriptor);

  // create LABEL for Target
  const labeledTarget = new faceapi.LabeledFaceDescriptors('Ivan Novikov', descriptions);
  // create Matcher
  const faceMatcher = new faceapi.FaceMatcher(labeledTarget, 0.6);
  
  return faceMatcher;
})
.then((fm) => {
  // parse fake db
  console.log('I am in fm STEP - all rigth');
  
  console.log('===========================');
  console.log(db);



  const results = db.map(face => {
    return {
      path: face.path,
      result: fm.findBestMatch(face.desc.descriptor).toString().trim(),
    }
  });
  return results.filter(el => el.result.split(' ')[0] !== 'unknown');
})
.then((res) => {
  console.log('we are in results');
  console.log('===========================');
  console.log('final filtered');
  console.log(res);
  console.log('===========================');
  // we are here!!!!!!!!!!!!!!!!1
  Promise.all(res.map(result => {
    const newPath = result.path.split('/')[2];
    fs.promises.copyFile(result.path, `./results/${newPath}`);
  }))

})
.then(() => {console.log('operation complete!')});

