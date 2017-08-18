var util = require('util');

module.exports = function Camera(){

    this.filename = null;
    this.folder = null;
    this.parameters= [];
    
    this.takePicture = function takePicture(file,callback){
        
        if (typeof(file) == "function") {
            callback = file;
            file=null;
        }
        
        if(!this.folder){
            this.folder = util.format("%s/pitures", __dirname);
        }
        
        if(file){
            this.filename = util.format("%s/%s", this.folder, file);
        }else{
            this.filename = util.format("%s/%s.jpg", this.folder, new Date().toJSON());
        }
        
        this.output(this.filename);
        
        this.command = "fswebcam";
        
        for (key in this.parameters) {
            
            //JD: remove this as .nopreview required a value in order to be set but the command did not require a value
            //if (this.parameters[key]){
                this.command+= util.format(' %s %s ', key, this.parameters[key]);
            //}
            
        }
        
        var exec = require('child_process').exec,child;
        
        var self = this;

        console.log('executing...');
        console.log(this.command);
        console.log('---');
        
        child = exec(this.command,function (error, stdout, stderr) {
            
            if(callback!==undefined){
                callback(self.filename,stderr);
            }
            
        });
    },
    this.quality = function(value){
        
        this.parameters['-jpeg']= value;
        
        return this;
    },
    this.resolution = function(value){
        
        this.parameters['-r']= value;
        
        return this;
    },
    this.rotation= function(value){
        
        this.parameters["-rotate"] = value;
        
        return this;
        
    },
    this.output= function(value){
        
        this.filename = value;
        this.parameters["-save"] = value;
        
        return this;
        
    },
    this.verbose= function(value){
        
        this.parameters["-v"] = value;
        
        return this;
        
    },
    this.loop= function(value){
        
        this.parameters["-l"] = value;
        
        return this;
        
    },
    this.baseFolder = function(directory){
        this.folder = directory;

        // JD added return this to allow chaining
        return this;
    }
};

