const fs = require('fs');
const path = require('path');

const CODE_SYNC_PATH = path.resolve(`${__dirname}/../dist/code-sync.js`);
const CODE_MAIN_PATH = path.resolve(process.env.CUSTOM_CODE_PATH || `${__dirname}/../dist/main.js`);
console.log(`CODE MAIN PATH: ${CODE_MAIN_PATH}`);

exports.getCodeSync = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(CODE_SYNC_PATH, (err, data) => {
      if (err != null) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

exports.getCodeMain = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(CODE_MAIN_PATH, (err, data) => {
      if (err != null) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

exports.onNewBuild = (callback) => {

  try{
      fs.watch(CODE_MAIN_PATH, callback);
  }catch(e){
    console.log(JSON.stringify(e));
    if(e.code == "ENOENT"){
      console.log(`waiting for ${CODE_MAIN_PATH} (${e.code})`);
      fs.watchFile(CODE_MAIN_PATH, (curr, prev) => {

        if(curr.mtimeMs ==0)return;

        console.log(`${CODE_MAIN_PATH} created`);
        fs.unwatchFile(CODE_MAIN_PATH);
        exports.onNewBuild(callback);
        callback();
      });


    }else{
      throw e;
    }
  }
};

