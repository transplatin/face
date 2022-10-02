import "@tensorflow/tfjs-core";
import canvas, { Canvas, Image, ImageData } from "canvas";
import faceapi from "face-api.js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const minConfidence = 0.5;
const maxResults=100;
const inputSize = 416;
const scoreThreshold = 0.5;
const minFaceSize = 100;
const scaleFactor = 0.8;
const MODEL_URL = path.join(__dirname, "./weights");

/*
 Simulate canvas in nodejs as browser is not available
*/

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_URL);
await faceapi.nets.mtcnn.loadFromDisk(MODEL_URL);
await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
await faceapi.nets.ageGenderNet.loadFromDisk(MODEL_URL);
await faceapi.nets.faceExpressionNet.loadFromDisk(MODEL_URL);
await faceapi.nets.faceLandmark68TinyNet.loadFromDisk(MODEL_URL);
await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);

const getFaceDetectorOptions = (model = "ssd", modelOptions = false) => {
  const options = {
    ssd: {
      minConfidence,
      maxResults
    },
    tiny: {
      inputSize,
      scoreThreshold,
    },
    mtcnn: {
      minFaceSize,
      scaleFactor,
    },
  };
  switch (model) {
    case "tiny":
      return new faceapi.TinyFaceDetectorOptions(
        options[modelOptions || model]
      );
    case "mtcnn":
      return new faceapi.MtcnnOptions(options[modelOptions || model]);
    default:
      return new faceapi.SsdMobilenetv1Options(options[modelOptions || model]);
  }
};

const face = () => {
  /*
  Function to calculate unique signature/descriptor for image.
  */
  const computeDescriptor = (
    options = {
      source: null,
      single: false,
      tinyLandmarks: false,
      model: "ssd",
      modelOptions: false,
    }
  ) =>
    new Promise(async (res, rej) => {
      try {
        const faceDetectionOptions = getFaceDetectorOptions(
          options.model,
          options.modelOptions
        );
        const referenceImage = await canvas.loadImage(options.source);

        const results = options.single
          ? await faceapi
              .detectSingleFace(referenceImage, faceDetectionOptions)
              .withFaceLandmarks(options.tinyLandmarks)
              .withAgeAndGender()
              .withFaceExpressions()
              .withFaceDescriptor()
          : await faceapi
              .detectAllFaces(referenceImage, faceDetectionOptions)
              .withFaceLandmarks(options.tinyLandmarks)
              .withAgeAndGender()
              .withFaceExpressions()
              .withFaceDescriptors();
        if (results === undefined || results.length == 0) {
          let models = ["tiny", "ssd", "mtcnn"];
          rej(
            `Unable to find any face in the picture. Try changing 'model' to either "${models
              .filter((e) => e != options.model)
              .join('" or "')}" or use a different image.`
          );
        }
        res(results);
      } catch (e) {
        rej(e);
      }
    });

  const matchFace = (matchOptions = { data: null, query: null }) => {
    const faceMatcher = new faceapi.FaceMatcher(matchOptions.data); // with or without labels depending on data
    /*
     To find in group photo
    */
    if (Array.isArray(matchOptions.query) && matchOptions.query.length > 0) {
      let resultArr = [];
      matchOptions.query.forEach((fd) => {
        const bestMatch = faceMatcher.findBestMatch(fd.descriptor);
        resultArr.push(bestMatch);
      });
      return resultArr;
    }
    /*
     Single photo match
    */
    if (matchOptions.query) {
      const bestMatch = faceMatcher.findBestMatch(
        matchOptions.query.descriptor
      );
      return bestMatch;
    }
  };

  return {
    computeDescriptor,
    matchFace,
    labelFaces: faceapi.LabeledFaceDescriptors,
  };
};

export default face;
