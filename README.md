
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

You can also set **"tinyNet"** to **true**, this will use tiny model to recognize faces faster compromising the accuracy. Additionally you can also set **"tinyLandmarks"** to **true** to compute even faster but the difference won't be much.

```javascript
(async () => {
  const { computeDescriptor, labelFaces, matchFace } = (
    await import("@transplatin/face")
  ).default();

   // Using tiny model to compute faster 

  const image = await computeDescriptor({
    single:true,
    tinyNet:true,
    tinyLandmarks:true,
    source: `https://media1.popsugar-assets.com/files/thumbor/Oql1wVACp_CDKHgMtTKJfgpsNwY/0x180:2844x3024/fit-in/500x500/filters:format_auto-!!-:strip_icc-!!-/2020/04/01/728/n/1922398/8a30f5815e84c133509775.55225480_/i/Daniel-Radcliffe.jpg`,
  });

  // Now, give this descriptor unique name

  const knownFaces = [new labelFaces("Daniel Radcliffe", [image.descriptor])];

  // Using tiny model to compute faster 

  const query = await computeDescriptor({
    single:true,
    tinyNet:true, 
    source: `https://images.mubicdn.net/images/cast_member/23750/cache-5650-1627288844/image-w856.jpg`,
  });

  // Now, check the sample image for a match

  const result = matchFace({ data: knownFaces, query: query });
  console.log(result)

})();
```

**Output**

```shell
FaceMatch { _label: 'Daniel Radcliffe', _distance: 0.441352749102419 }
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
    tinyNet: true,
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
    tinyNet: true,
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
      tinyNet: true,
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

