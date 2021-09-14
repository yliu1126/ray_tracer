// routines for creating a ray tracing scene
let fov = 0.0;
let red = 0.0;
let green = 0.0;
let blue = 0.0;
let a_red = 0.0;
let a_green = 0.0;
let a_blue = 0.0;
let eye_x = 0.0;
let eye_y = 0.0;
let eye_z = 0.0;
let lights = [];
let rays = [];
let shapes = [];
let U;
let V;
let W;

//new var for 3b
let sampleLevel = 0;
let jitter;
let areaLights = [];


// NEW COMMANDS FOR PART B

// create a new disk
function new_disk (x, y, z, radius, nx, ny, nz, dr, dg, db, k_ambient, k_specular, specular_pow) {
  append(shapes, new Disk(x, y, z, radius, nx, ny, nz, dr, dg, db, k_ambient, k_specular, specular_pow));
}

// create a new area light source
function area_light (r, g, b, x, y, z, ux, uy, uz, vx, vy, vz) {
  append(areaLights, new areaLight(r, g, b, x, y, z, ux, uy, uz, vx, vy, vz));
}

function set_sample_level (num) {
  sampleLevel = num;
}

function jitter_on() {
  jitter = true;
}

function jitter_off() {
  jitter = false;
}


// OLD COMMANDS FROM PART A (some of which you will still need to modify)


// clear out all scene contents
function reset_scene() {
  fov = 0.0;
  red = 0.0;
  green = 0.0;
  blue = 0.0;
  a_red = 0.0;
  a_green = 0.0;
  a_blue = 0.0;
  eye_x = 0.0;
  eye_y = 0.0;
  eye_z = 0.0;
  lights = [];
  shapes = [];
  U = createVector(0, 0, 0);
  V = createVector(0, 0, 0);
  W = createVector(0, 0, 0);
  
  areaLights = [];
}

// create a new point light source
function new_light (r, g, b, x, y, z) {
  append(lights, new Light(r, g, b, x, y, z));
}

// set value of ambient light source
function ambient_light (r, g, b) {
  a_red = r;
  a_green = g;
  a_blue = b;
}

// set the background color for the scene
function set_background (r, g, b) {
  red = r;
  green = g;
  blue = b;
}

// set the field of view
function set_fov (theta) {
  fov = theta;
}

// set the position of the virtual camera/eye
function set_eye_position (x, y, z) {
  eye_x = x;
  eye_y = y;
  eye_z = z;
}

// set the virtual camera's viewing direction
function set_uvw(x1,y1, z1, x2, y2, z2, x3, y3, z3) {
  U = createVector(x1, y1, z1);
  V = createVector(x2, y2, z2);
  W = createVector(x3, y3, z3);
}

// create a new sphere
function new_sphere (x, y, z, radius, dr, dg, db, k_ambient, k_specular, specular_pow) {
  append(shapes, new Sphere(x, y, z, radius, dr, dg, db, k_ambient, k_specular, specular_pow));
}

// create an eye ray based on the current pixel's position
function eye_ray_uvw (i, j) {
  return new Ray(i, j);
}

// this is the main routine for drawing your ray traced scene
function draw_scene() {
  noStroke();  // so we don't get a border when we draw a tiny rectangle
  // go through all the pixels in the image
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      
          
      let r = 0, g = 0, b = 0;  // placeholders to store the pixel's color
      
      for (let sy = 0; sy < sampleLevel; sy++) {
        for (let sx = 0; sx < sampleLevel; sx++) {
          let subx = x + ((sx + 1) / (sampleLevel + 1)) - 0.5;
          let suby = y + ((sy + 1) / (sampleLevel + 1)) - 0.5;
          
          // create eye ray
          let ray = eye_ray_uvw (subx, suby);
          
          // maybe print debug information
          debug_flag = 0;
          //if (x == width / 2 && y == height / 2) { debug_flag = 1;  }  // un-comment to debug center pixel
          
          if (debug_flag) {
            console.log ("debug at: " + x + " " + y);
          }
          
          let min_t = 9999;
          let hitobj = null;
          for (let i = 0; i < shapes.length; i++) {
            console.log(shapes[i]);
            let t = shapes[i].checkInter(ray);
            if (t < min_t && t > 0) {
              min_t = t;
              hitobj = shapes[i];
            }
          }
          
          // Figure out the pixel's color here (FOR YOU TO WRITE!!!)
          
          if (hitobj == null) {
            r = red;
            g = green;
            b = blue;
          } else {
            r += hitobj.k_ambient * hitobj.dr * a_red;
            g += hitobj.k_ambient * hitobj.dg * a_green;
            b += hitobj.k_ambient * hitobj.db * a_blue;
            
            let blee = p5.Vector.mult(ray.direction, min_t);
            let hitpos = p5.Vector.add(ray.origin, blee);
            let normal = hitobj.getNormal(ray);
            for (let i = 0; i < lights.length; i++) {
              //soft shadow
              let min_t_1 = 9999;
              let shadow = null;
              for (let j = 0; j < shapes.length; j++) {
                let shadowD = hitobj.pointLightVectors(ray)[i].direction;
                let shadowO = hitobj.pointLightVectors(ray)[i].origin;
                let t_1 = shapes[j].checkInter(new ShadowRay(shadowD, shadowO));
                if (t_1 < min_t_1 && t_1 > 0) {
                  min_t_1 = t_1;
                  shadow = shapes[j];
                }
                if (shadow != null) {
                  if (shadow.tmin > 0 && shadow.tmin < 0) {
                    r += 0;
                    g += 0;
                    b += 0;
                  }
                } else {
                  let lightpos = p5.Vector.sub(lights[i].getLightVector(), hitpos).normalize();
                  r += lights[i].r * max(0, p5.Vector.dot(normal, lightpos));
                  g += lights[i].g * max(0, p5.Vector.dot(normal, lightpos));
                  b += lights[i].b * max(0, p5.Vector.dot(normal, lightpos));
                }
              }
            }
            for (let i = 0; i < areaLights.length; i++) {
              //soft shadow
              let min_t_2 = 9999;
              let shadow = null;
              for (let j = 0; j < shapes.length; j++) {
                let shadowD = hitobj.areaLightVectors(ray, subx, suby)[i].direction;
                let shadowO = hitobj.areaLightVectors(ray, subx, suby)[i].origin;
                let t_2 = shapes[j].checkInter(new ShadowRay(shadowD, shadowO));
                if (t_2 < min_t_2 && t_2 > 0) {
                  min_t_2 = t_2;
                  shadow = shapes[j];
                }
                if (shadow != null) {
                  if (shadow.tmin > 0 && shadow.tmin < 1) {
                    r += 0;
                    g += 0;
                    b += 0;
                  }
                } else {
                  /*
                  let arealightpos = p5.Vector.sub(areaLights[i].getLightVector(), hitpos);
                  let new_U = areaLights[i].getUVector();
                  let new_V = areaLights[i].getVVector();
                  let subx2 = ((subx + 1 + rand) / (sampleLevel + 1)) * 2 - 1;
                  let suby2 = ((suby + 1 + rand) / (sampleLevel + 1)) * 2 - 1;
                  new_U = p5.Vector.mult(U, subx2);
                  new_V = p5.Vector.mult(V, suby2);
                  arealightpos = p5.Vector.add(new_U, p5.Vector.add(new_V, arealightpos)).normalize(); 
                  */
                  let arealightpos = shadowD.normalize();
                  r += areaLights[i].r * max(0, p5.Vector.dot(normal, arealightpos.normalize()));
                  g += areaLights[i].g * max(0, p5.Vector.dot(normal, arealightpos.normalize()));
                  b += areaLights[i].b * max(0, p5.Vector.dot(normal, arealightpos.normalize()));
                }
              }
            }
            r *= hitobj.dr;
            g *= hitobj.dg;
            b *= hitobj.db;
            /*
            r = 1;
            g = 0;
            b = 0;
            */
          }
        }
      }
      r = r / sq(sampleLevel);
      g = g / sq(sampleLevel);
      b = b / sq(sampleLevel);
      //console.log(r + " " + g + " " + b);
      // set the pixel color, converting values from [0,1] into [0,255]
      fill (255 * r, 255 * g, 255 * b);
      
      rect (x, y, 1, 1);   // make a little rectangle to fill in the pixel
    }
  }
  
}

class Light {
  constructor(r, g, b, x, y, z) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  getLightVector() {
    return createVector(this.x, this.y, this.z);
  }
}

class areaLight {
  constructor(r, g, b, x, y, z, ux, uy, uz, vx, vy, vz) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.x = x;
    this.y = y;
    this.z = z;
    this.ux = ux;
    this.uy = uy;
    this.uz = uz;
    this.vx = vx;
    this.vy = vy;
    this.vz = vz;
  }
  
  getUVector() {
    return createVector(this.ux, this.uy, this.uz);
  }
  
  getVVector() {
    return createVector(this.vx, this.vy, this.vz);
  }
  
  getLightVector() {
    return createVector(this.x, this.y, this.z);
  }
}

class Ray {
  constructor(i, j) {
    this.u = -1 + 2 * i / width;
    this.v = -(-1 + 2 * j / height);
    this.d = 1 / (tan(radians(fov / 2)));
    this.origin = createVector(eye_x, eye_y, eye_z);
    let dx = -this.d * W.array()[0] + this.u * U.array()[0] + this.v * V.array()[0];
    let dy = -this.d * W.array()[1] + this.u * U.array()[1] + this.v * V.array()[1];
    let dz = -this.d * W.array()[2] + this.u * U.array()[2] + this.v * V.array()[2];
    this.direction = createVector(dx, dy, dz);
  }
}

class ShadowRay {
  constructor(direction, origin) {
    this.direction = direction;
    this.origin = origin;
  }
}

class Shape {
  checkInter(ray) {
    return -1;
  }
}

class Sphere extends Shape{
  constructor(x, y, z, radius, dr, dg, db, k_ambient, k_specular, specular_pow) {
    super();
    this.Ox = x;
    this.Oy = y;
    this.Oz = z;
    this.radius = radius;
    this.dr = dr;
    this.dg = dg;
    this.db = db;
    this.k_ambient = k_ambient;
    this.k_sepcular = k_specular;
    this.specular_pow = specular_pow;
    
    let tin;
  }
  
  checkInter(ray) {
    let dx = ray.direction.array()[0];
    let dy = ray.direction.array()[1];
    let dz = ray.direction.array()[2];
    
    let x0 = ray.origin.array()[0];
    let y0 = ray.origin.array()[1];
    let z0 = ray.origin.array()[2];
    
    let a = dx*dx + dy*dy + dz*dz;
    let b = 2 * (dx*(x0 - this.Ox) + dy*(y0 - this.Oy) + dz*(z0 - this.Oz));
    let c = Math.pow((x0 - this.Ox), 2) + Math.pow((y0 - this.Oy), 2) + Math.pow((z0 - this.Oz), 2) - (this.radius * this.radius);
    let det = (b * b) - (4 * a * c);
    if (det >= 0) {
      let t1 = (-b + sqrt(det)) / (2 * a);
      let t2 = (-b - sqrt(det)) / (2 * a);
      if (t1 >= 0 && t2 >= 0) {
        this.tin = min(t1, t2);
        return min(t1, t2);
      } else if (t1 < 0 && t2 > 0) {
        this.tin = t2;
        return t2;
      } else if (t2 < 0 && t1 > 0) {
        this.tin = t1;
        return t1;
      } else {
        return -1;
      }
    }
    return -1;
  }
  
  getNormal(ray) {
    //let normal = p5.Vector.sub(hitpos, createVector(this.Ox, this.Oy, this.Oz));
    let x = ray.origin.array()[0] + this.tin * ray.direction.array()[0] - this.Ox;
    let y = ray.origin.array()[1] + this.tin * ray.direction.array()[1] - this.Oy;
    let z = ray.origin.array()[2] + this.tin * ray.direction.array()[2] - this.Oz;
    let n = createVector(x, y, z);
    return n.normalize();
  }
  
  pointLightVectors(ray) {
    let ls = [];
    for (let i = 0; i < lights.length; i++) {
      let blee = p5.Vector.mult(ray.direction, this.tin);
      let hitpos = p5.Vector.add(ray.origin, blee);
      let o = createVector(ray.origin.array()[0] + this.tin * ray.direction.array()[0] + 0.0001 * this.getNormal(ray).array()[0],
          ray.origin.array()[1] + this.tin * ray.direction.array()[1] + 0.0001 * this.getNormal(ray).array()[1],
          ray.origin.array()[2] + this.tin * ray.direction.array()[2] + 0.0001 * this.getNormal(ray).array()[2]);
      let lightpos = p5.Vector.sub(lights[i].getLightVector(), hitpos);
      let output = {
        origin: o,
        direction: lightpos,
      };
      append(ls, output);
    }
    return ls;
  }
  
  areaLightVectors(ray, subx, suby) {
    let al = [];
    //jitter
    let rand = 0;
    if (jitter) {
      rand = Math.random() - 0.5;
    }
    for (let i = 0; i < areaLights.length; i++) {
      let blee = p5.Vector.mult(ray.direction, this.tin);
      let hitpos = p5.Vector.add(ray.origin, blee);
      let arealightpos = p5.Vector.sub(areaLights[i].getLightVector(), hitpos);
      let new_U = areaLights[i].getUVector();
      let new_V = areaLights[i].getVVector();
      let subx2 = ((subx + 1 + rand) / (sampleLevel + 1)) * 2 - 1;
      let suby2 = ((suby + 1 + rand) / (sampleLevel + 1)) * 2 - 1;
      new_U = p5.Vector.mult(U, subx2);
      new_V = p5.Vector.mult(V, suby2);
      let o = createVector(ray.origin.array()[0] + this.tin * ray.direction.array()[0] + 0.0001 * this.getNormal(ray).array()[0],
          ray.origin.array()[1] + this.tin * ray.direction.array()[1] + 0.0001 * this.getNormal(ray).array()[1],
          ray.origin.array()[2] + this.tin * ray.direction.array()[2] + 0.0001 * this.getNormal(ray).array()[2]);
      arealightpos = p5.Vector.add(new_U, p5.Vector.add(new_V, arealightpos));
      let output = {
        origin: o,
        direction: arealightpos,
      };
      append(al, output);
    }
    return al;
  }
  
  getTMin() {
    return this.tmin;
  }
}

class Disk extends Shape{
  constructor(x, y, z, radius, nx, ny, nz, dr, dg, db, k_ambient, k_specular, specular_pow) {
    super();
    this.Ox = x;
    this.Oy = y;
    this.Oz = z;
    this.radius = radius;
    this.nx = nx;
    this.ny = ny;
    this.nz = nz;
    this.dr = dr;
    this.dg = dg;
    this.db = db;
    this.k_ambient = k_ambient;
    this.k_sepcular = k_specular;
    this.specular_pow = specular_pow;
    
    let tin;
  }
  
  checkInter(ray) {
    let dx = ray.direction.array()[0];
    let dy = ray.direction.array()[1];
    let dz = ray.direction.array()[2];
    
    let x0 = ray.origin.array()[0];
    let y0 = ray.origin.array()[1];
    let z0 = ray.origin.array()[2];
    
    let d = -(this.nx * this.x + this.ny * this.y + this.nz * this.z);
    let num = -d - (this.nx * x0 + this.ny * y0 + this.nz * z0);
    let denom = dx * this.nx + dy * this.ny + dz * this.nz;
    if (denom != 0) {
      this.tin = num / denom;
      if (this.tin > 0) {
        let p = [ray.origin.array()[0] + tin * dx, ray.origin.array()[1] + tin * dy, ray.origin.array()[2] + tin * dz];
        let dist = sqrt(sq(this.Ox - p[0]) + sq(this.Oy - p[1]) + sq(this.Oz - p[2]));
        if (dist <= this.radius) {
          return this.tin;
        }
      } else {
        return -1;
      }
    } else {
      return -1;
    }
  }
  //actually have nothing to do with the param
  getNormal(ray) {
    let normal = createVector(this.nx, this.ny, this.nz);
    return normal;
  }
  
  pointLightVectors(ray) {
    let ls = [];
    for (let i = 0; i < lights.length; i++) {
      let blee = p5.Vector.mult(ray.direction, this.tin);
      let hitpos = p5.Vector.add(ray.origin, blee);
      let o = createVector(ray.origin.array()[0] + this.tin * ray.direction.array()[0] + 0.0001 * this.getNormal(ray).array()[0],
          ray.origin.array()[1] + this.tin * ray.direction.array()[1] + 0.0001 * this.getNormal(ray).array()[1],
          ray.origin.array()[2] + this.tin * ray.direction.array()[2] + 0.0001 * this.getNormal(ray).array()[2]);
      let lightpos = p5.Vector.sub(lights[i].getLightVector(), hitpos);
      let output = {
        origin: o,
        direction: lightpos,
      };
      append(ls, output);
    }
    return ls;
  }
}
