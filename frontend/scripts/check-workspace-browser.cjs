const assert=require("node:assert/strict");
const {spawn}=require("node:child_process");
const {chromium}=require("playwright");
const server=spawn(process.execPath,[require.resolve("next/dist/bin/next"),"start","--hostname","127.0.0.1","--port","3123"],{stdio:["ignore","pipe","pipe"]});
let output="";server.stdout.on("data",chunk=>output+=chunk);server.stderr.on("data",chunk=>output+=chunk);
const base="http://127.0.0.1:3123";
const lines=Array.from({length:3},(_,i)=>({id:i+1,name:"WRM"+(i+1),positions:Array.from({length:10},(_,j)=>({id:i*10+j+1,position_number:j+1,current_stand:{id:i*10+j+1,code:"S"+(i*10+j+1),installed_at:"2026-11-01T00:00:00Z",campaign_hours:48,leakage:i===0&&j===1,vibration:false,abnormal_sound:false}}))}));
const assets=[
 {id:100,asset_code:"WRM2-MOTOR-UNLOCATED",name:"Motor awaiting walkdown",asset_type:"MOTOR",module_code:"MIR",parent_id:null,position:null,location:null,area:null,equipment:null,manufacturer:null,model:null,installation_date:null,status:"ACTIVE",criticality:"HIGH",notes:null},
 {id:101,asset_code:"RM-ASSEMBLY",name:"Roughing assembly",asset_type:"STAND",module_code:"RMIR",parent_id:null,position:"1",location:"WRM1",area:"Roughing Mill",equipment:"Roughing Mill",manufacturer:null,model:null,installation_date:null,status:"ACTIVE",criticality:"HIGH",notes:null}
];
const jobs=[{id:1,title:"Gearbox inspection",module_code:"RMIR",schedule_type:"INSPECTION",line_name:"WRM1",equipment:"RM-ASSEMBLY",start_at:"2026-11-27T09:00:00Z",end_at:"2026-11-27T10:00:00Z",status:"PLANNED",assigned_to:"Maintenance team",work_scope:"Inspect coupling and gearbox condition",impact:"Isolation required",remarks:""}];
const inventory=[{id:1,name:"Bearing kit",quantity:5,minimum_quantity:8,location:"Store",is_active:true,expected_life_hours:500,observed_avg_life_hours:450,availability_pct:62.5,reliability_pct:90,criticality:"HIGH",used_at:"WRM1"}];
async function ready(){for(let i=0;i<150;i++){if(output.includes("Ready in"))return;if(server.exitCode!==null)throw Error(output);await new Promise(resolve=>setTimeout(resolve,100));}throw Error("Next server did not start: "+output);}
async function setup(browser,editor=true,viewport={width:1440,height:1000}){
 const context=await browser.newContext({viewport});
 if(editor)await context.addInitScript(()=>{localStorage.setItem("dsr_access_token","fixture-session");localStorage.setItem("dsr_user",JSON.stringify({id:1,username:"engineer",role_id:1,role:"ADMIN"}));});
 const page=await context.newPage();
 const errors=[];page.on("pageerror",error=>errors.push(error.message));
 await page.route("http://localhost:8000/api/v1/**",async route=>{
  const request=route.request(),url=new URL(request.url()),path="/"+url.pathname.replace("/api/v1","").split("/").filter(Boolean).join("/");
  const headers={"access-control-allow-origin":"*","access-control-allow-headers":"authorization,content-type","access-control-allow-methods":"GET,POST,PATCH,DELETE,OPTIONS"};
  if(request.method()==="OPTIONS")return route.fulfill({status:204,headers});
  if(request.method()!=="GET"){
   await new Promise(resolve=>setTimeout(resolve,200));
   return route.fulfill({status:400,headers,contentType:"application/json",body:JSON.stringify({detail:"Fixture rejected this change; records were not saved."})});
  }
  let body={};
  if(path==="/dashboard")body=lines;
  else if(path==="/assets/catalog")body={assets,source:"asset_registry"};
  else if(path==="/stands")body=[...lines.flatMap(line=>line.positions.map(position=>({id:position.current_stand.id,code:position.current_stand.code,current_status:"INSTALLED"}))),{id:80,code:"READY80",current_status:"READY"},{id:81,code:"READY81",current_status:"READY"}];
  else if(path==="/inventory")body=inventory;
  else if(path==="/maintenance-schedules")body={schedules:jobs.filter(job=>url.searchParams.get("module")==="ALL"||!url.searchParams.get("module")||job.module_code===url.searchParams.get("module"))};
  else if(path==="/reliability/events")body={events:[]};
  else if(path==="/reliability/components")body={components:[]};
  return route.fulfill({status:200,headers,contentType:"application/json",body:JSON.stringify(body)});
 });
 return {context,page,errors};
}
async function text(locator,value){await locator.filter({hasText:value}).first().waitFor();}
async function noOverflow(page){const sizes=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:window.innerWidth}));assert(sizes.width<=sizes.viewport+1,"Document overflow: "+JSON.stringify(sizes));}
(async()=>{
 let browser;
 try{
  await ready();browser=await chromium.launch({headless:true});
  const desktop=await setup(browser),page=desktop.page;
  await page.goto(base+"/dashboard");await page.getByRole("heading",{name:"Shift equipment overview"}).waitFor();
  await text(page.locator(".engineer-kpi"),"Installed stands");
  await page.locator(".engineer-kpi").filter({hasText:"Installed stands"}).getByText("30",{exact:true}).waitFor();
  await page.locator(".engineer-kpi").filter({hasText:"Ready spare stands"}).getByText("2",{exact:true}).waitFor();
  await page.getByRole("navigation",{name:"Primary workspaces"}).waitFor();
  await noOverflow(page);
  await page.getByRole("button",{name:"Collapse workflow sidebar"}).click();
  assert.equal(await page.locator(".ati-desktop-sidebar").isVisible(),false);
  await page.reload();await page.getByRole("button",{name:"Expand workflow sidebar"}).waitFor();
  assert.equal(await page.locator(".ati-desktop-sidebar").isVisible(),false);
  await page.getByRole("button",{name:"Expand workflow sidebar"}).click();

  await page.goto(base+"/equipment?line=WRM1");
  await page.getByRole("button",{name:/RM-ASSEMBLY/}).waitFor();
  assert.equal(await page.getByRole("button",{name:/WRM2-MOTOR-UNLOCATED/}).count(),0);
  await page.getByLabel("Line / location").selectOption("__unassigned");
  await page.getByRole("button",{name:/WRM2-MOTOR-UNLOCATED/}).click();
  await page.getByRole("heading",{name:"WRM2-MOTOR-UNLOCATED",exact:true}).waitFor();
  await page.reload();await page.getByRole("heading",{name:"WRM2-MOTOR-UNLOCATED",exact:true}).waitFor();

  await page.goto(base+"/inventory");
  await page.getByRole("button",{name:"Bearing kit",exact:true}).click();
  await page.getByRole("dialog",{name:"Bearing kit"}).waitFor();
  await page.getByLabel("New store quantity").fill("3");
  await page.getByLabel("Reason",{exact:true}).fill("Cycle count");
  await page.getByRole("button",{name:"Confirm stock movement"}).click();
  await text(page.getByRole("alert"),"Fixture rejected");
  assert.equal(await page.getByText("Stock movement saved to the transaction history.").count(),0);
  await page.keyboard.press("Escape");assert.equal(await page.getByRole("dialog").count(),0);
  await page.getByLabel("Search spares").fill("Bearing");
  await page.waitForURL(/q=Bearing/);await page.reload();
  assert.equal(await page.getByLabel("Search spares").inputValue(),"Bearing");

  await page.goto(base+"/maintenance?job=1");
  await page.getByRole("heading",{name:"Gearbox inspection",exact:true}).waitFor();
  await text(page.locator(".maintenance-detail-section"),"Inspect coupling and gearbox condition");
  await page.getByRole("button",{name:"Plan maintenance",exact:true}).click();
  await page.getByRole("dialog",{name:"Plan maintenance window"}).waitFor();
  await page.keyboard.press("Escape");

  await page.goto(base+"/operations");
  await page.getByRole("button",{name:"Record change",exact:true}).first().click();
  await page.getByRole("dialog").waitFor();
  await page.getByLabel("Ready replacement").selectOption("READY80");
  await page.getByRole("button",{name:"Scheduled rotation",exact:true}).click();
  await page.getByRole("button",{name:"Confirm Stand Change",exact:true}).click();
  await text(page.getByRole("dialog"),"Fixture rejected");
  assert.equal(await page.getByText(/saved\. Removed stand moved/).count(),0);
  await page.keyboard.press("Escape");

  const mobile=await setup(browser,false,{width:390,height:844}),phone=mobile.page;
  for(const route of ["/dashboard","/equipment","/inventory","/maintenance","/stand-area","/operations"]){
   await phone.goto(base+route);await phone.locator("main").first().waitFor();await noOverflow(phone);
  }
  assert.equal(await phone.getByRole("button",{name:"Record change",exact:true}).count(),0);
  await phone.getByRole("button",{name:"Open navigation"}).click();
  await phone.getByRole("complementary",{name:"Mobile workspace navigation"}).waitFor();
  await phone.keyboard.press("Escape");
  assert.equal(await phone.getByRole("complementary",{name:"Mobile workspace navigation"}).count(),0);
  assert.deepEqual(desktop.errors,[]);assert.deepEqual(mobile.errors,[]);
  console.log("Browser checks passed: dual rail, persistent collapse, physical locations, shareable selections, table inspectors, server-confirmed failures, maintenance details and mobile layouts.");
 }finally{if(browser)await browser.close();server.kill("SIGTERM");}
})().catch(error=>{console.error(error);process.exitCode=1});
