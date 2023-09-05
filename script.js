// MAIN lib
import * as faceapi from 'face-api.js';

// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
import '@tensorflow/tfjs-node';

// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
import * as canvas from 'canvas';

// For work with filepaths 
import fs from 'fs';

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })


// ЗАГРУЗКА МОДЕЛЕЙ распознавания и определения
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromDisk('./models'),
  faceapi.nets.faceLandmark68Net.loadFromDisk('./models'),
  faceapi.nets.ssdMobilenetv1.loadFromDisk('./models')
]).then(start)

// После загрузки моделей запускаем колбэк
async function start() {
  
  // функция распознавания, определения дескрипторов, складывает считанные дескрипторы в выполненные промисы в массив
  const labeledFaceDescriptors = await loadLabeledImages();
  console.log(labeledFaceDescriptors);

  // создаём матчер из уже подготовленных дескрипторов
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)

  // вешаме событие на ИНПУТ
  
    
    // files[0] - это инструкция вытазить картинку из инпута и засунуть её в буфер фаэсапи
    // HERE upload image from DISC
    // const image = await faceapi.bufferToImage(imageUpload.files[0]);

    // производим распознавание загруженной фотографии (селфи)
    // const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
    
    // !!! ВНИМАНИЕ !!! ЭТОТ МОМЕНТ НУЖНО РАЗОБРАТЬ В ДНО
    // const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor));
    
  
}

//===========================================================================
// САМОЕ ИНТЕРЕСНОЕ - НУЖНО ВНЕДРИТЬ СУЩНОСТИ В НОДЫ
//===========================================================================

// Создание дескрипторов, меток с подписями (именами героев)
function loadLabeledImages() {
  const labels = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg'];
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      
        // загрузить фото для снятия дескрипторов
        const img = await faceapi.fetchImage(`store/${label}`);
        // создать определения
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        // заполнить массив этими определениями
        // ВАЖНО, ЭТО ИМЕННО ТО ЧТО БУДЕТ ИСПОЛЬЗОВАТЬ СЕЛФИ ДЛЯ СОЗДАНИЯ ДЕСКРИПТОРОВ
        descriptions.push(detections.descriptor)
      
      // создаём объект в который снимаем все дескрипторы (важно!!! сюда можно добавить и позу и выражение и сделать составным БОНУС!!!)
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}

