
const Koa = require('koa');
const Router = require('koa-router');
const path = require('path')
const swig = require('swig');
const router = new Router();
const app = new Koa();
const asyncBusboy = require('async-busboy');
const request = require('request')

const templateRoot = path.join(__dirname, "./")

const namespacesWhiteList = ["muxiauth", "muxisite"]
const nameWhiteList = ["muxiauthfe"]

function requestToK8s(payLoad) {
  return new Promise( (resolve, reject) => {
    request({
            // will be ignored
            method: 'PATCH',
            uri: 'http://127.0.0.1:8080',
             headers: [
                {
                  name: 'content-type',
                  value: 'application/strategic-merge-patch+json'
                }
              ],
              body: `{"spec":{"template":{"spec":{"containers":[{"name":"muxiauthfe","image":"registry-internal.cn-shenzhen.aliyuncs.com/muxiauth/muxiauth_fe:1.0-beta7"}]}}}}`
          }, function (error, response, body) {
              // body...
              console.log(error, response, body)
              resolve(response)
          })

  })
}

router.get('/', function(ctx, next){
 let template = swig.compileFile(path.resolve(templateRoot, "index.html"));
        ctx.body = template({})
});


router.post('/', async function(ctx, next){
     const parsed = await asyncBusboy(ctx.req);
     const name = parsed.fields.name;
     const namespace = parsed.fields.namespace;
     const image = parsed.fields.image;
     let message = "";

     if (nameWhiteList.indexOf(name) > -1 && namespacesWhiteList.indexOf(namespace) > -1) {

          let payLoad = {
            spec: {
                template: {
                    spec: {
                        containers: [
                            {
                                name: name, 
                                image: image, 
                                env: [{name: "PLEASE_REPULLIMAGE", value: Math.random()}]
                            }
                        ]
                }
            }
          }}
          await requestToK8s(payLoad);
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