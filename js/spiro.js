$(window).ready(function(){
 var ele = document.getElementById('canvas_fix');
 var ele1 = document.getElementById('canvas_dyn');
  var contextFix = ele.getContext("2d");
  var contextDyn = ele1.getContext("2d");
  var center = [450,450];
  var config = {};
  
  var graph = new Melutio.Spirograph.Graph(315,center,50,contextFix,contextDyn);
  var tree = new Melutio.Spirograph.GraphTree(document.getElementById('tree'),graph);
  var loader = new Melutio.Spirograph.GraphLoadManager(document.getElementById('save_list'),tree);
  graph.reset();
  
// dirty code  
  
   $('#type').change(function(){
    displayType($(this).val());
   });
  
  var sizeEle = $('#size'),
      runInnerEle = $('#run_inner'),
      colorEle = $('#color'),
      typeEle = $('#type')
  ;

  $( "#dialog-form" ).dialog({
			autoOpen: false,
			height: 250,
			width: 350,
			modal: true,
			buttons: {
        add: {
        text: 'add',
        'class': 'add_btn',
        click:function(){
          var size = parseInt(sizeEle.val());
          var inner = runInnerEle.is(':checked')?true:false;
          var type = typeEle.val();
          var color = colorEle.val();
          var offset = parseInt($('#offset').val());
          if(offset>0)
            offset = 2*Math.PI*offset/360;
          if(size>0){
            if(!this.parentEntity)
              tree.addRootElementWithSize(size,inner,offset);
             else{
              if(type==1){
                tree.addCircleToParent(this.parentEntity,size,inner,offset);
              }else{
                tree.addPointToParent(this.parentEntity,size,color,offset);
              }
             }
          }
          $(this).dialog( "close" );
        }},
        edit: {
        text: 'edit',
        'class': 'edit_btn',
        click:function(){
          if(!this.editElement){
            alert('Edit not possible.');
            return;
          }
            
          var size = parseInt(sizeEle.val());
          var inner = runInnerEle.is(':checked')?true:false;
          var color = colorEle.val();
          var offset = parseInt($('#offset').val());
          if(offset>0)
            offset = 2*Math.PI*offset/360;
          if(size>0){
            tree.editElement(size,inner,color,this.editElement,offset);
          }
          $(this).dialog( "close" );
        }},
				cancel: function() {
					$( this ).dialog( "close" );
				}
			},
			 open: function(event, ui) {
        if(this.parentEntity){
          typeEle.val(1);
          displayType(1);
        }else{
          displayType(0);
        }
        var offset = 0;
        if(this.editElement){
          if(this.editElement.child.isDrawer){
            var size = this.editElement.child.size;
            var inner = this.editElement.child.inner;
            var color = '';
          }else{
            var form = $( "#dialog-form");
            var size = this.editElement.child.distance;
            var inner = '';
            var color = this.editElement.child.color;
            
            form.find('.point').css('display','block');
            form.find('.circle').css('display','none');
            
          }
          var offset = this.editElement.child.offset/(2*Math.PI)*360;
          if(inner)
            $( runInnerEle ).attr('checked',true);
          else
             $( runInnerEle ).attr('checked',false);
          sizeEle.val(size);
            if(color==''){
                color = '#FFFFFF';
            }
          colorEle.val(color);
          $('#offset').val(offset);
          $(this).parent().find('.ui-dialog-buttonpane .add_btn').css('display','none');
          $(this).parent().find('.ui-dialog-buttonpane .edit_btn').css('display','inline');
        }else{
          $('#offset').val(offset);
          $(this).parent().find('.ui-dialog-buttonpane .edit_btn').css('display','none');
          $(this).parent().find('.ui-dialog-buttonpane .add_btn').css('display','inline');
        }
			  },
			close: function() {
				$( this ).find('input').not('[type=color]').val('');
				$( runInnerEle ).attr('checked',false);
			}
		});
});

function displayType(type){
 var form = $( "#dialog-form");

  switch(parseInt(type)){
    case 0:
      form.find('.type_selection').css('display','none');
      form.find('.point').css('display','none');
      form.find('.circle').css('display','block');
    break;
    case 1:
    case '1':
      form.find('.type_selection').css('display','block');
      form.find('.point').css('display','none');
      form.find('.circle').css('display','block');
    break;
    case 2:
    case '2':
      form.find('.type_selection').css('display','block');
      form.find('.point').css('display','block');
      form.find('.circle').css('display','none');
    break;
  }
}

// dirty code  end


Melutio = {Spirograph:{}};

//////////////////////////////////////////////////////////////////////////////////////

Melutio.Spirograph.Graph = function(size,center,speed,staticCanvas,dynamicCanvas){
  this.childs = [];
  var angle = 0;
  var $this = this;
  var realSpeed = Math.PI/speed;
  this.running = false;
  this.isDrawn = false;
  this.PI2 = Math.PI*2;
  this.drawSelf = function(){
      dynamicCanvas.beginPath();
      dynamicCanvas.arc(center[0], center[1], size, 0, Math.PI*2, true); 
      dynamicCanvas.stroke();
      dynamicCanvas.closePath();
  }
  this.addChild = function(size,inner,offset){
    var child = new Melutio.Spirograph.Drawer(size,inner,offset);
    this.childs.push(child);
    return child;
  }
  
  this.reset = function(onlyDynamic){
    dynamicCanvas.clearRect(0,0,900,900);
    if(typeof(onlyDynamic)=='undefined' || !onlyDynamic)
      staticCanvas.clearRect(0,0,900,900);
    angle = 0;
    for(var i=0,len=this.childs.length;i<len;i++){
      this.childs[i].reset();
    }
    this.update();
  }
  this.removeItem  = function(child){
    for(var i=0,len=this.childs.length;i<len;i++){
      if(this.childs[i]==child){
        this.childs.splice(i,1);
        return;
      }
      this.childs[i].removeItem(child);
    }
  }
  
  this.update = function(){
    dynamicCanvas.clearRect(0,0,900,900);
    this.drawSelf();
    for(var i=0,len=this.childs.length;i<len;i++){
      this.childs[i].update(this,angle,dynamicCanvas,staticCanvas);
    }
  }
  this.getSize = function(){
    return size;
  }
  this.getCenter = function(){
    return center;
  }
  this.setSize = function(psize){
    size = psize;
  }
  this.setCenter = function(pcenter){
    center=[pcenter[0],pcenter[1]];
  }
  
  this.getDynamicCanvas = function(){
    return dynamicCanvas;
  }
  
  this.getStaticCanvas = function(){
    return staticCanvas;
  }
  
  this.start = function(refreshrate){
    if(!this.running){
      this.running = window.setInterval(function(){
        if($this.isFinished()){
           $this.stop();
           return;
        }
        angle += realSpeed;
        $this.update();
      },refreshrate);
     }
  }
  
  this.stop = function(){
    if(this.running){
      window.clearInterval(this.running);
      this.running = false;
      dynamicCanvas.clearRect(0,0,900,900);
    }
  }
}

Melutio.Spirograph.Graph.prototype.toJson = function(){
  var ret = {
    size:this.getSize(),
    center:[this.getCenter()[0],this.getCenter()[1]],
    children:[]
  };
  for(var i=0,len=this.childs.length;i<len;i++){
      ret.children.push(this.childs[i].toJson());
    }
  return ret;
}

Melutio.Spirograph.Graph.prototype.isFinished = function(){
   for(var i=0,len=this.childs.length;i<len;i++){
     if(!this.childs[i].isFinished())
        return false;
   }
   return true;
}

Melutio.Spirograph.Graph.prototype.convertToPng = function(){
    return document.getElementById('canvas_fix').toDataURL("image/png");
}

//////////////////////////////////////////////////////////////////////////////////////

Melutio.Spirograph.GraphLoadManager = function(element,tree){
  this.element = element;
  this.tree = tree;
  this.markedElement = null;
  this.addHandlers();
}

Melutio.Spirograph.GraphLoadManager.prototype.addHandlers = function(){
  $self = this;
  $('#save').click(function(){$self.save();});
  $('#load').click(function(){$self.load();});
  $(this.element).delegate('.load_item','click',function(){$self.handleItemClick(this);return false;});
}

Melutio.Spirograph.GraphLoadManager.prototype.handleItemClick = function(ele){
  if($(ele).hasClass('ui-state-active')){
      this.markedElement = null;
       $(this.element).find('.load_item').removeClass('ui-state-active');
    }else{
      this.markedElement = ele;
      $(this.element).find('.load_item').removeClass('ui-state-active');
      $(ele).addClass('ui-state-active');
    }
}

Melutio.Spirograph.GraphLoadManager.prototype.save = function(){
  var jsonString = this.tree.save();
  $(this.element).find('#save_info').val(JSON.stringify(jsonString));
  this.addSaveEntry(jsonString);
}

Melutio.Spirograph.GraphLoadManager.prototype.addSaveEntry = function(data){
  var date = new Date();
  var markup = '\
  <li class="load_item ui-state-default ui-corner-all"><label>'+date.getDate()+'.'+(date.getMonth()+1)+'.'+date.getFullYear()+' '+date.getHours()+':'+date.getMinutes()+'</label></li>\
  ';
  var ele = $(markup);
  ele[0].savedData = data;
  $(this.element).append(ele);
}

Melutio.Spirograph.GraphLoadManager.prototype.load = function(){
  if(this.markedElement){
    return this.tree.load(this.markedElement.savedData);
  }
  var data = $(this.element).find('#custom_json').val();
  try{
    data = JSON.parse(data);
    this.tree.load(data);
  }catch(e){
    alert('Data could not be loaded.');
  }
}

//////////////////////////////////////////////////////////////////////////////////////


Melutio.Spirograph.GraphTree = function(element,graph){
  this.element = element;
  this.graph = graph;
  this.addHandlers();
}

Melutio.Spirograph.GraphTree.prototype.addHandlers = function(){
  var $self = this;
  $(this.element).find('.add_base').click(function(){$self.handleRootClick();});
  $(this.element).delegate('.icon','click',function(){$self.handleItemClick(this);});
  $('#start').click(function(){$self.graph.start(1);});
  $('#reset').click(function(){$self.graph.reset();});
  $('#reset_dynamics').click(function(){$self.graph.reset(true);});
  $('#stop').click(function(){$self.graph.stop();});
  $('#save_image').click(function(){$self.convertToPng();});
}

Melutio.Spirograph.GraphTree.prototype.convertToPng = function(){
  var img = this.graph.convertToPng();
  window.open(img);
}

Melutio.Spirograph.GraphTree.prototype.handleRootClick = function(){
  this.graph.stop();
  this.addElementDialog();
}

Melutio.Spirograph.GraphTree.prototype.handleItemClick = function(ele){
  var parent = $(ele).closest('.tree_element');
  if(parent.length < 1)
    return alert('Parent not found');
  parent = parent[0];
  if(!parent.child)
    return alert('Element not found');
  this.graph.stop();
   if($(ele).hasClass('edit')){
    this.editElementDialog(parent);
   }
   if($(ele).hasClass('remove')){
    this.removeElement(parent);
   }
   if($(ele).hasClass('add')){
    this.addChildDialog(parent);
   } 
}

Melutio.Spirograph.GraphTree.prototype.addElementDialog = function(){
    $( "#dialog-form" )[0].editElement = null;
    $( "#dialog-form" )[0].parentEntity = null;
		$( "#dialog-form" ).dialog( "open" );
}

Melutio.Spirograph.GraphTree.prototype.addRootElementWithSize = function(size,inner,offset){
  var child = this.graph.addChild(size,inner,offset);
  var ele = this.createCircleMenuItem(size);
  ele[0].child = child;
  ele[0].circle = true;
  $(this.element).append(ele);
  this.graph.reset(true);
  return ele[0];
}

Melutio.Spirograph.GraphTree.prototype.createCircleMenuItem = function(size){
  var markup = ' \
    <li class="tree_element ui-state-default ui-corner-all"> \
      <h4>Circle with Size ('+size+')</h4>\
      <ul class="icon_wrapper">\
        <li><span class="edit ui-icon icon ui-icon-document"></span></li>\
        <li><span class="add ui-icon icon ui-icon-plusthick">+</span></li>\
        <li><span class="remove ui-icon icon ui-icon-minusthick">-</span></li>\
      </ul>\
      <div class="cb"></div>\
      <ul class="sub_elements"></ul>\
    </li> \
    ';
   return $(markup);
}

Melutio.Spirograph.GraphTree.prototype.createPointMenuItem = function(size){
  var markup = ' \
    <li class="tree_element ui-state-default ui-corner-all"> \
      <h4>Point with Size ('+size+')</h4>\
      <ul class="icon_wrapper">\
        <li><span class="edit ui-icon icon ui-icon-document"></span></li>\
        <li><span class="remove ui-icon icon ui-icon-minusthick">-</span></li>\
      </ul>\
      <div class="cb"></div>\
    </li> \
    ';
   return $(markup);
}

/**
*@todo
*/
Melutio.Spirograph.GraphTree.prototype.addCircleToParent = function(parentEntity,size,inner,offset){
  if(parentEntity.child){
    var child = parentEntity.child.addChild(size,inner,offset);
    var ele = this.createCircleMenuItem(size);
    ele[0].child = child;
    ele[0].circle = true;
    $(parentEntity).find('.sub_elements').first().append(ele);
    this.graph.reset(true);
    return ele[0];
  }
  return null;
}

Melutio.Spirograph.GraphTree.prototype.save = function(){
  return this.graph.toJson();
}

Melutio.Spirograph.GraphTree.prototype.load = function(data){
  this.graph.reset(true);
  var old = $(tree).find('.tree_element');
  for(var i=1,len=old.length;i<len;i++){
    this.removeElement(old[i]);
  }
  this.graph.setSize(data.size);
  this.graph.setCenter(data.center);
  
  this.loadChildren(null,data.children);
}

Melutio.Spirograph.GraphTree.prototype.loadChildren = function(parentEntity,children){
  var subelement = null;
  for(var i=0,len=children.length;i<len;i++){
     if(parentEntity===null){
        if(children[i].type!=1)
            throw 'Loading failed unexpected child type';
        subelement = this.addRootElementWithSize(children[i].size,children[i].inner,children[i].offset);
        if(subelement)
           this.loadChildren(subelement,children[i].children);
     }else if(children[i].type==1){
        subelement = this.addCircleToParent(parentEntity,children[i].size,children[i].inner,children[i].offset);
        if(subelement)
           this.loadChildren(subelement,children[i].children);
     } else {
        subelement = this.addPointToParent(parentEntity,children[i].size,children[i].color,children[i].offset);
     }
  }
}


Melutio.Spirograph.GraphTree.prototype.addPointToParent = function(parentEntity,size,color,offset){
if(parentEntity.child){
  var child = parentEntity.child.addPoint(size,color,offset);
  var ele = this.createPointMenuItem(size);
  ele[0].child = child;
  ele[0].circle = false;
  $(parentEntity).find('.sub_elements').first().append(ele);
  this.graph.reset(true);
  return ele[0];
  }
  return null;
}

Melutio.Spirograph.GraphTree.prototype.editElement = function(size,inner,color,editElement,offset){
  if(editElement.circle){
    $(editElement).find('h4').first().html('Circle with Size ('+size+')');
    editElement.child.inner = inner;
    editElement.child.size = size;
    editElement.child.offset = offset;
  }else{
    $(editElement).find('h4').first().html('Point with Size ('+size+')');
    editElement.child.color = color;
    editElement.child.distance = size;
    editElement.child.offset = offset;
  }
  
  this.graph.reset(true);
}

Melutio.Spirograph.GraphTree.prototype.editElementDialog = function(ele){
  $( "#dialog-form" )[0].editElement = ele;
  $( "#dialog-form" )[0].parentEntity = null;
  $( "#dialog-form" ).dialog( "open" );
}

Melutio.Spirograph.GraphTree.prototype.removeElement = function(ele){
  this.graph.removeItem(ele.child);
  $(ele).remove();
  this.graph.reset(true);
}

Melutio.Spirograph.GraphTree.prototype.addChildDialog = function(ele){
  $( "#dialog-form" )[0].parentEntity = ele;
  $( "#dialog-form" )[0].editElement = null;
  $( "#dialog-form" ).dialog( "open" );
}

//////////////////////////////////////////////////////////////////////////////////////

Melutio.Spirograph.Drawer = function(size,inner,offset){
  this.childs = [];
  this.reset();
  this.size = size;
  this.inner = inner;
  this.state = 1;
  this.storedStartInfos = [];
  this.offset = offset;
}

Melutio.Spirograph.Drawer.prototype.isDrawer = true;

Melutio.Spirograph.Drawer.prototype.addChild = function(size,inner,offset){
    var child = new Melutio.Spirograph.Drawer(size,inner,offset);
    this.childs.push(child);
    return child;
}

Melutio.Spirograph.Drawer.prototype.removeItem  = function(child){
    for(var i=0,len=this.childs.length;i<len;i++){
      if(this.childs[i]==child){
        this.childs.splice(i,1);
        return;
      }
      this.childs[i].removeItem(child);
    }
  }

Melutio.Spirograph.Drawer.prototype.reset = function(){
  this.state = 1;
  this.calculatedAngle = 0;
  this.calculatedCenter = [0,0];
  this.storedStartInfos = [];
  for(var i=0,len=this.childs.length;i<len;i++){
     this.childs[i].reset();
  }
}

Melutio.Spirograph.Drawer.prototype.addPoint = function(distance,color,offset){
    var child = new Melutio.Spirograph.DrawerPoint(distance,color,offset);
    this.childs.push(child);
    return child;
}

Melutio.Spirograph.Drawer.prototype.update = function(parent,angle,dynamicCanvas,staticCanvas){
    if(!this.calcualteAngleAndPosition(angle,parent.getSize(),parent.getCenter()))
      return;
    this.redrawSelf(dynamicCanvas);
    this.redrawChilds(dynamicCanvas,staticCanvas);
}

Melutio.Spirograph.Drawer.prototype.getSize = function(){
    return this.size;
}

Melutio.Spirograph.Drawer.prototype.getCenter = function(){
    return this.calculatedCenter;
}

Melutio.Spirograph.Drawer.prototype.toJson = function(){
  var ret = {
    size:this.getSize(),
    inner:this.inner,
    type:1,
    offset:this.offset,
    children:[]
  };
  for(var i=0,len=this.childs.length;i<len;i++){
      ret.children.push(this.childs[i].toJson());
    }
  return ret;
}

Melutio.Spirograph.Drawer.prototype.calcualteAngleAndPosition = function(angle,parentSize,parentCenter){  
  if(this.isFinished())
    return false;
  angle += this.offset;
  this.calculatedAngle = -angle*(parentSize-this.getSize())/this.getSize();
  if(!this.inner)
    var dif = parentSize+this.size;
  else
    var dif = parentSize-this.size;
  this.calculatedCenter[0] = Math.cos(angle)*dif+parentCenter[0];
  this.calculatedCenter[1] = Math.sin(angle)*dif+parentCenter[1];
 if(this.state == 1){
    this.storedStartInfos = [Math.cos(this.calculatedAngle),this.calculatedCenter[0],this.calculatedCenter[1]];
  }
  if(
    this.state == 2
      && 
    Math.abs(Math.cos(this.calculatedAngle)-this.storedStartInfos[0])<0.001 
      && 
     Math.abs(this.calculatedCenter[0]-this.storedStartInfos[1])<0.001 
      &&
    Math.abs(this.calculatedCenter[1]-this.storedStartInfos[2])<0.001 
   ){
     this.state = 3;
  }
  if(this.state == 1)
    this.state = 2;
  return true;
}

Melutio.Spirograph.Drawer.prototype.redrawSelf = function(canvas){
  var center = this.calculatedCenter;
  canvas.beginPath();
  canvas.arc(center[0],center[1], this.size, 0, Math.PI*2, true); 
  canvas.stroke();
  canvas.closePath();
  return 
}

Melutio.Spirograph.Drawer.prototype.redrawChilds = function(dynamicCanvas,staticCanvas){
  for(var i=0,len=this.childs.length;i<len;i++){
     this.childs[i].update(this,this.calculatedAngle,dynamicCanvas,staticCanvas);
   }
}

Melutio.Spirograph.Drawer.prototype.isFinished = function(){
  if(this.state!=3)
    return false;
   for(var i=0,len=this.childs.length;i<len;i++){
     if(!this.childs[i].isFinished())
        return false;
   }
   return true;
}

//////////////////////////////////////////////////////////////////////////////////////

Melutio.Spirograph.DrawerPoint = function(distance,color,offset){
 this.offset = offset;
  this.distance = distance;
  this.color = color;
  this.reset();
}

Melutio.Spirograph.DrawerPoint.prototype.reset = function(){
  this.lastPoint = [0,0];
  this.lastPointIsSet = false;
}

Melutio.Spirograph.DrawerPoint.prototype.isFinished = function(){
  return true;
}

Melutio.Spirograph.DrawerPoint.prototype.removeItem  = function(child){

 }

Melutio.Spirograph.DrawerPoint.prototype.update = function(parent,angle,dynamicCanvas,staticCanvas){
  parentCenter = parent.getCenter();
  angle += this.offset;
  var centerx = Math.cos(angle)*this.distance+parentCenter[0];
  var centery = Math.sin(angle)*this.distance+parentCenter[1];
  dynamicCanvas.beginPath();
  dynamicCanvas.arc(centerx, centery, 2, 0, Math.PI*2, true);
  dynamicCanvas.stroke();
  dynamicCanvas.closePath();
  if(!this.lastPointIsSet)
    return this.setLastPoint(centerx, centery);
  staticCanvas.save();
  staticCanvas.beginPath();
  staticCanvas.moveTo(this.lastPoint[0],this.lastPoint[1]);
  staticCanvas.lineTo(centerx, centery);
  staticCanvas.strokeStyle = this.color;
  staticCanvas.stroke();
  staticCanvas.closePath();
  staticCanvas.restore();
  return this.setLastPoint(centerx, centery);
}

Melutio.Spirograph.DrawerPoint.prototype.toJson = function(){
  var ret = {
    size:this.distance,
    color:this.color,
    offset:this.offset,
    type:2
  };
  return ret;
}

Melutio.Spirograph.DrawerPoint.prototype.setLastPoint = function(centerx, centery){
  this.lastPointIsSet = true;
  this.lastPoint[0] = centerx;
  this.lastPoint[1] = centery;
  return this.lastPoint;
}

