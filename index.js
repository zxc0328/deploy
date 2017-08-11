
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

router.get('/', function(ctx, next){
 let template = swig.compileFile(path.resolve(templateRoot, "index.html"));
        ctx.body = template({})
});


router.post('/', async function(ctx, next){
     const parsed = await asyncBusboy(ctx.req);
     const name = parsed.fields.name;
     const namespace = parsed.fields.namespace;
     const image = parsed.fields.image;

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
          request({
            // will be ignored
            method: 'PATXH',
            uri: 'http://127.0.0.1:8080',
             headers: [
                {
                  name: 'content-type',
                  value: 'application/strategic-merge-patch+json'
                }
              ],
              body: JSON.stringify(payLoad)
          }, function (argument) {
              // body...
              console.log(argument)
          })
     }

    let message = "部署成功！请耐心等待几分钟后查看部署是否成功。有问题请咨询"
    let template = swig.compileFile(path.resolve(templateRoot, "result.html"));
        ctx.body = template({message:message})    
});

app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3000);
console.log('listening on port 3000');