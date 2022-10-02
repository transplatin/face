
# Face Recognition

Face recognition for Node JS.

## Installation


```bash
   npm i @transplatin/face

   OR

   yarn add @transplatin/face
```
    
## Usage/Examples

It takes some time to load the models, wait for 2-3 seconds before using it.

```javascript
(async () => {
  const { computeDescriptor, labelFaces, matchFace } = (
    await import("@transplatin/face")
  ).default();

  // Caculate descriptor for an image, it is like a signature for a face.

  const image = await computeDescriptor({
    single:true,
    source: `https://media1.popsugar-assets.com/files/thumbor/Oql1wVACp_CDKHgMtTKJfgpsNwY/0x180:2844x3024/fit-in/500x500/filters:format_auto-!!-:strip_icc-!!-/2020/04/01/728/n/1922398/8a30f5815e84c133509775.55225480_/i/Daniel-Radcliffe.jpg`,
  });

  // Now, give this descriptor unique name

  const knownFaces = [new labelFaces("Daniel Radcliffe", [image.descriptor])];

  // Now, you have a dataset of known face. Now test a sample image of "Daniel Radcliffe"

  const query = await computeDescriptor({
    single:true,
    source: `https://images.mubicdn.net/images/cast_member/23750/cache-5650-1627288844/image-w856.jpg`,
  });

  // Now, check the sample image for a match

  const result = matchFace({ data: knownFaces, query: query });
  console.log(result)

})();
```
**Output**

```shell
[
  FaceMatch {
    _label: 'Daniel Radcliffe',
    _distance: 0.45356237703131697
  }
]
```

*Less distance means two faces are more similar. Default threshold is 0.5. So, you can discard the result with distance exceeding 0.5.*

---

You can also set **"model"** to either **tiny** or **mtcnn**, these will use tiny model to recognize faces faster compromising the accuracy. The default model is **"ssd"**. Additionally you can also set **"tinyLandmarks"** to **true** to compute even faster but the difference won't be much.

**Models**

**ssd** : Default, high accuracy and slower.


**modelOptions** (Optional)

```javascript
{
  /*
   minimum confidence threshold
   default: 0.5
  */
  minConfidence?: number

  /* 
  maximum number of faces to return
  default: 100
  */
  maxResults?: number
}
```

**tiny** : Uses tiny model to compute faster.

**modelOptions** (Optional)
```shell
{
  /*
   size at which image is processed, the smaller the faster,
   but less precise in detecting smaller faces, must be divisible
   by 32, common sizes are 128, 160, 224, 320, 416, 512, 608,
   for face tracking via webcam I would recommend using smaller sizes,
   e.g. 128, 160, for detecting smaller faces use larger sizes, e.g. 512, 608
   default: 416
 */
  inputSize?: number

  /*
   minimum confidence threshold
   default: 0.5
  */
  scoreThreshold?: number
}
```

**mtcnn** : Smaller 2mb model to faster detection. Can be configured to perform even faster.

**modelOptions** (Optional)
```shell
{
  /*
   minimum face size to expect, the higher the faster processing will be,
   but smaller faces won't be detected
   default: 100
  */
  minFaceSize?: number

  /*
   the score threshold values used to filter the bounding
   boxes of stage 1, 2 and 3
  default: [0.6, 0.7, 0.7]
  */
  scoreThresholds?: number[]

  /*
   scale factor used to calculate the scale steps of the image
   pyramid used in stage 1
   default: 0.8
  */
  scaleFactor?: number

  /*
   number of scaled versions of the input image passed through the CNN
   of the first stage, lower numbers will result in lower inference time,
   but will also be less accurate
  default: 10
  */
  maxNumScales?: number

  /*
   instead of specifying scaleFactor and maxNumScales you can also
   set the scaleSteps manually
  */
  scaleSteps?: number[]
}
```

```javascript
(async () => {
  const { computeDescriptor, labelFaces, matchFace } = (
    await import("./index.mjs")
  ).default();

   // Using tiny model to compute faster 

  const image = await computeDescriptor({
    single:true,
    model:"mtcnn",
    source: `https://media1.popsugar-assets.com/files/thumbor/Oql1wVACp_CDKHgMtTKJfgpsNwY/0x180:2844x3024/fit-in/500x500/filters:format_auto-!!-:strip_icc-!!-/2020/04/01/728/n/1922398/8a30f5815e84c133509775.55225480_/i/Daniel-Radcliffe.jpg`,
  });

  // Now, give this descriptor unique name

  const knownFaces = [new labelFaces("Daniel Radcliffe", [image.descriptor])];

  // Using mtcnn model with additional configuration to compute faster 

  const query = await computeDescriptor({
    single:true,
    model:"mtcnn",
    modelOptions:{
      minFaceSize:100,
      scaleFactor:0.8,
    },
    source: `https://m.media-amazon.com/images/M/MV5BZmE0NzNiNzQtYTVlYS00MjljLWE4MTgtYzYxNjU2NjZkM2M4XkEyXkFqcGdeQXVyNjY5NDgzNjQ@._V1_.jpg`,
  });

  // Now, check the sample image for a match

  const result = matchFace({ data: knownFaces, query: query });
  console.log(result)

})();
```

**Output**

```shell
FaceMatch {
  _label: 'Daniel Radcliffe',
  _distance: 0.28621610211714177
}
```
***

You can also set **"single"** to **false**. To check for multiple faces in an image.

**Note**: Setting **"single"** to **false** will return an array instead of object. So, if you are using it for dataset then you should update the labels of descriptors accordingly.

```javascript
(async () => {
  const { computeDescriptor, labelFaces, matchFace } = (
    await import("@transplatin/face")
  ).default();

  // Calculating for multiple faces in group image
  const image = await computeDescriptor({
    model: "tiny",
    source: `https://deadline.com/wp-content/uploads/2021/11/MCDHAP2_EC349-e1637084134223.jpg`,
  });

  // Now, give each face descriptor a unique name
  
  const knownFaces = [
    new labelFaces("Daniel Radcliffe", [image[0].descriptor]),  // updating according to array, notice the image[0]
    new labelFaces("Rupert Grint", [image[1].descriptor]),
    new labelFaces("Emma Watson", [image[2].descriptor]),
  ];

  // Now, you have a dataset of known faces. Now test a sample image of Daniel Radcliffe.

  const query = await computeDescriptor({
    single: false, // Expliciting specifying single to false
    source: `https://images.mubicdn.net/images/cast_member/23750/cache-5650-1627288844/image-w856.jpg`,
  });

  // Now, check the sample image for a match

  const result = matchFace({ data: knownFaces, query: query });
  console.log(result);
})();
```

**Output**

```shell
[
  FaceMatch {
    _label: 'Daniel Radcliffe',
    _distance: 0.4698559970070638
  }
]
```
***

If you do not assign any label to any face, it'll automatically assign labels for matched faces.

```javascript 
(async () => {
  const { computeDescriptor, labelFaces, matchFace } = (
    await import("@transplatin/face")
  ).default();

   // Calculating for multiple faces in group image
  const  faces = await computeDescriptor({
    model: "tiny",
    source: `https://deadline.com/wp-content/uploads/2021/11/MCDHAP2_EC349-e1637084134223.jpg`,
  });


  const query = await computeDescriptor({
    source: `https://images.mubicdn.net/images/cast_member/23750/cache-5650-1627288844/image-w856.jpg`,
  });

  // Now, check the sample image for a match

  const result = matchFace({ data: faces, query: query });
  
  console.log("Total Faces :",faces.length);
  console.log(result)
})();
```

**Output**

```shell
Total Faces : 3
[ FaceMatch { _label: 'person 1', _distance: 0.4698559970070638 } ]
```
*Notice how detected face has been assinged with a label **"person 1"***.

***
   
You can also determine age, gender and expressions for face.

```javascript
(async () => {
  const { computeDescriptor } = (
    await import("@transplatin/face")
  ).default();

  // Determining Gender, Gender Probability, Age and Expressions.
  
  const { gender, genderProbability, age, expressions } =
    await computeDescriptor({
      model: "tiny",
      single: true,
      source: `https://images.mubicdn.net/images/cast_member/23750/cache-5650-1627288844/image-w856.jpg`,
    });

  console.log("Gender : ",gender);
  console.log("Gender Probability : ",genderProbability);
  console.log("Age : ",age);
  console.log("Expressions : ",expressions);

})();
```

**Output**
```shell
Gender :  male
Gender Probability :  0.9627662301063538
Age :  41.07072830200195
Expressions :  FaceExpressions {
  neutral: 0.272469162940979,
  happy: 0.0000017826562270784052,
  sad: 0.7273550033569336,
  angry: 0.000005635331035591662,
  fearful: 0.000151652202475816,
  disgusted: 2.1437733721541008e-7,
  surprised: 0.00001650248668738641
}
```



## License

[MIT](https://github.com/transplatin/face/blob/main/licence.txt)