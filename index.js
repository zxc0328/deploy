
const Koa = require('koa');
const Router = require('koa-router');
const path = require('path')
const swig = require('swig');
const router = new Router();
const app = new Koa();
const asyncBusboy = require('async-busboy');
const request = require('request')
const  shell = require('shelljs');

const templateRoot = path.join(__dirname, "./")

const namespacesWhiteList = ["muxiauth", "muxisite", "guisheng-fe", "guisheng-be", "guisheng-mana", "asynccnu"]
const nameWhiteList = ["muxiauthfe", "muxisite-main-api", "muxisite-auth-api", "muxisite-auth-fe", "muxisite-share-fe", "muxisite-blog-fe", "guisheng-fe", "guisheng-be", "guisheng-mana"]


router.get('/', function(ctx, next){
 let template = swig.compileFile(path.resolve(templateRoot, "index.html"));
        ctx.body = template({})
});


router.post('/', async function(ctx, next){
     const parsed = await asyncBusboy(ctx.req);
     const name = parsed.fields.name;
     const namespace = parsed.fields.namespace;
     const image = parsed.fields.image;
     const containerName = parsed.fields.containerName || name;
     const envKey = parsed.fields.envKey || "Bar";
     const envValue = parsed.fields.envValue || "Barz";
     let message = "";

     if (nameWhiteList.indexOf(name) > -1 && namespacesWhiteList.indexOf(namespace) > -1) {

          // let payLoad = {
          //   spec: {
          //       template: {
          //           spec: {
          //               containers: [
          //                   {
          //                       name: name, 
          //                       image: image, 
          //                       env: [{name: "PLEASE_REPULLIMAGE", value: Math.random()}]
          //                   }
          //               ]
          //       }
          //   }
          // }}
          // await requestToK8s(name, namespace, image);
          let command = `curl -X PATCH -H 'Content-Type: application/strategic-merge-patch+json' --data '
{"spec":{"template":{"spec":{"containers":[{"name":"${containerName}","image":"${image}", "env": [{"name":"${envKey}", "value": "${envValue}"},{"name":"PLEASE_REPULLIMAGE", "value": "${Math.random()}"}]}]}}}}' \
    'http://127.0.0.1:8001/apis/apps/v1beta1/namespaces/${namespace}/deployments/${name}'`
          if (shell.exec(command).code !== 0) {
            console.log('Error: Git commit failed');
          }
          message = "部署成功！请耐心等待几分钟后查看部署是否成功。有问题请咨询"
           
     }else {
         message = "非法输入"
     }
     let template = swig.compileFile(path.resolve(templateRoot, "result.html"));
     ctx.body = template({message:message})
});

app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3000);
console.log('listening on port 3000');