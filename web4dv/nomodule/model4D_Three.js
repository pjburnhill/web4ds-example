// **********************************************************
//
// WEB4DV
// THREE.js plug-in for 4Dviews volumetric video sequences
//
// Version: 3.1.0
// Release date: 18-December 2020
//
// Copyright: 4D View Solutions SAS
// Authors: M.Adam & T.Groubet
//
// NOTE:
// ADD: import WEB4DS from 'yourpath/web4dvImporter.js'
// in your main script
// Then create a WEB4DS object with the right parameters
// Call yourObject.load() to start the streaming
// OPTIONS:
// - yourObject.load( bool showPlaceholder, bool playOnload, callback() )
// Then you can call:
// - play/pause
// - mute/unmute
// - destroy
// - get some info like currentFrame or sequenceTotalLength
//
// **********************************************************

class Model4D {
  constructor() {
    this.geometry = null
    this.material = null
    this.texture = null
    this.mesh = null

    this.textureSizeX = 0
    this.textureSizeY = 0

    this.audioListener = null
    this.audioSound = null
    this.audioLoader = null
  }

  initMesh(vertices, uvs, indices, normals, textureEncoding, textureSizeX, textureSizeY, modelPosition) {
    this.geometry = new THREE.BufferGeometry()
    this.geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3))
    this.geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    this.geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3))
    this.geometry.setIndex(new THREE.BufferAttribute(indices, 1))
    this.geometry.dynamic = true

    if (textureEncoding === 164) {  // astc
      this.texture = new THREE.CompressedTexture(null, textureSizeX, textureSizeY,
        THREE.RGBA_ASTC_8x8_Format, THREE.UnsignedByteType, THREE.UVMapping,
        THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping,
        THREE.LinearFilter, THREE.LinearFilter)
    } else if (textureEncoding === 100) {  // dxt
      this.texture = new THREE.CompressedTexture(null, textureSizeX, textureSizeY,
        THREE.RGB_S3TC_DXT1_Format, THREE.UnsignedByteType, THREE.UVMapping,
        THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping,
        THREE.LinearFilter, THREE.LinearFilter)
    } else {  // rgba
      this.texture = new THREE.DataTexture(null, textureSizeX, textureSizeY, THREE.RGBAFormat,
        THREE.UnsignedByteType, THREE.UVMapping,
        THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping,
        THREE.LinearFilter, THREE.LinearFilter)
    }

    this.textureSizeX = textureSizeX
    this.textureSizeY = textureSizeY
    this.material = new THREE.MeshBasicMaterial({map: this.texture})

    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.name = 'mesh4D'
    this.mesh.position.x = modelPosition[0]
    this.mesh.position.y = modelPosition[1]
    this.mesh.position.z = modelPosition[2]

    this.mesh.castShadow = true

    this.surface = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10, 1, 1),
      new THREE.ShadowMaterial({
        opacity: 0.3,
      })
    )

    this.surface.rotateX(-Math.PI / 2)
    this.surface.position.set(modelPosition[0], modelPosition[1], modelPosition[2])
    this.surface.receiveShadow = true

    this.light = new THREE.DirectionalLight(0xffffff, 5)
    this.light.position.set(modelPosition[0], modelPosition[1] + 5, modelPosition[2])
    this.light.target = this.surface

    this.light.castShadow = true
    this.light.shadow.mapSize.width = 512
    this.light.shadow.mapSize.height = 512

    const d = 4
    this.light.shadow.camera.left = -d
    this.light.shadow.camera.right = d
    this.light.shadow.camera.top = d
    this.light.shadow.camera.bottom = -d
    this.light.shadow.camera.far = 10
  }

  updateMesh(Verts, Faces, UVs, Normals, Texture, nbVerts, nbFaces) {
    /* update the buffers */
    this.geometry.attributes.position.array = Verts

    /* flags */
    this.geometry.attributes.position.needsUpdate = true

    if (this.mesh.geometry.drawRange.count !== nbFaces * 3) {
      this.mesh.geometry.index.array = Faces
      this.geometry.attributes.uv.array = UVs
      this.geometry.attributes.uv.needsUpdate = true
      this.mesh.geometry.index.needsUpdate = true
      this.geometry.attributes.normal.array = Normals
      this.geometry.attributes.normal.needsUpdate = true

      /* to use only part of the buffer */
      this.geometry.setDrawRange(0, nbFaces * 3)
    }

    this.mesh.rotation.x = -1.57

    /* update the texture */
    const mipmap = {'data': Texture, 'width': this.textureSizeX, 'height': this.textureSizeY}
    const mipmaps = []
    mipmaps.push(mipmap)

    this.texture.mipmaps = mipmaps
    this.texture.needsUpdate = true
  }

  setPosition(modelPositionVec3) {
    this.mesh.position.x = modelPositionVec3[0]
    this.mesh.position.y = modelPositionVec3[1]
    this.mesh.position.z = modelPositionVec3[2]

    this.surface.position.set(modelPositionVec3[0], modelPositionVec3[1], modelPositionVec3[2])
    this.light.position.set(modelPositionVec3[0], modelPositionVec3[1] + 5, modelPositionVec3[2])
  }

  setRotation(modelOrientationVec3) {
    this.mesh.rotation.x = modelOrientationVec3[0]
    this.mesh.rotation.y = modelOrientationVec3[1]
    this.mesh.rotation.z = modelOrientationVec3[2]
  }

  initAudio(audioCtx) {
    this.audioListener = new THREE.AudioListener(audioCtx)
    this.audioSound = new THREE.PositionalAudio(this.audioListener)
  }

  loadAudioFile(audioFile, isAudioloaded, callback) {
    this.audioLoader = new THREE.AudioLoader()
    this.audioLoader.load(audioFile, (buffer) => {
      this.setAudioBuffer(buffer)
      isAudioloaded = true
      callback()
    })
  }

  setAudioBuffer(buffer) {
    this.audioSound.setBuffer(buffer)
    this.audioSound.setLoop(false)
    this.audioSound.setVolume(0)
  }
}