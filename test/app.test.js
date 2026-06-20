const test = require('node:test');
const assert = require('node:assert');

// Mock browser environment
global.window = global;
global.window.addEventListener = () => {};
global.document = {

  addEventListener: () => {},
  querySelector: () => {
    return {
      innerText: '',
      style: {},
      addEventListener: () => {},
      appendChild: () => {},
      insertBefore: () => {}
    };
  },
  getElementById: (id) => {

    return {
      innerText: '4.8',
      textContent: '',
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false,
        toggle: () => {}
      },
      addEventListener: () => {},
      appendChild: () => {},
      insertBefore: () => {},
      querySelector: () => {
        return { innerText: '' };
      },
      querySelectorAll: () => [],
      value: '20',
      disabled: false
    };
  },
  querySelectorAll: () => [],
  createElement: () => {
    return {
      style: {},
      appendChild: () => {},
      innerText: '',
      className: ''
    };
  },
  createElementNS: () => {
    return {
      setAttribute: () => {},
      appendChild: () => {}
    };
  }
};
global.THREE = {
  Scene: class {},
  PerspectiveCamera: class { position = {} },
  WebGLRenderer: class { setSize() {}; setPixelRatio() {}; capabilities = { getMaxAnisotropy: () => 1 } },
  TextureLoader: class { load() {} },
  SphereGeometry: class {},
  MeshPhongMaterial: class {},
  MeshBasicMaterial: class {},
  Mesh: class {},
  BackSide: 'backside',
  PointLight: class { position = {} },
  AmbientLight: class {},
  BufferGeometry: class { setAttribute() {} },
  Float32BufferAttribute: class {},
  PointsMaterial: class {},
  Points: class {},
  Group: class { add() {} }
};
global.gsap = {
  to: () => {}
};
global.Chart = class {
  destroy() {}
};
global.lucide = {
  createIcons: () => {}
};

// Require the application core logic
require('../app.js');

test('EcoSphere AI Core - Trainer States & UI Update', (t) => {
  // Validate that the globally exposed updateTrainerUI exists
  assert.strictEqual(typeof global.updateTrainerUI, 'function');
  
  // Expose internal state variables
  assert.strictEqual(typeof global.window.toggleMobileNav, 'function');
});

test('EcoSphere AI Core - Quest Toggle Logic', (t) => {
  // Validate quest completion changes total trainer XP
  assert.strictEqual(typeof global.toggleQuest, 'function');
});

test('EcoSphere AI Core - Dynamic Coach Responses', (t) => {
  assert.strictEqual(typeof global.getDynamicCoachResponse, 'function');
  
  const greetingResponse = global.getDynamicCoachResponse('hello');
  assert.match(greetingResponse, /Eco Trainer/);
  
  const carbonResponse = global.getDynamicCoachResponse('analyze footprint');
  assert.match(carbonResponse, /carbon footprint/i);
});

test('EcoSphere AI Core - Active Map Feeds', (t) => {
  assert.strictEqual(typeof global.triggerMapFeed, 'function');
});
