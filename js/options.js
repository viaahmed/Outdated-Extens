const MIN_SIZE_VALUE = 400;
const MAX_SIZE_VALUE = 600;
Options = {
    data		: localStorage['data'] ? JSON.parse(localStorage['data']) : {
        'options' : {
            'sync' 	: true,
            'size'	: 'm'
        }
    },

    initialize	: function() {
        if(!this.data.options) {
            this.data.options = {
                'sync' : true
            }
        }

        /* Sizes */
        this.data.options.fontSize	 = this.data.options.fontSize || '14px';
        this.data.options.fontFamily = this.data.options.fontFamily || 'default';
        this.data.options.size       = this.data.options.size || '400';


        if(this.data.options.fontSize) {
            this.select('font-size', this.data.options.fontSize);
        }


        if(this.data.options.fontFamily) {
            this.select('font-family', this.data.options.fontFamily);
        }

        if(this.data.options.size) {
            var numbered = Number(this.data.options.size);
            document.querySelector("#size").value =  (numbered > MAX_SIZE_VALUE || !numbered) ? MAX_SIZE_VALUE
                : (numbered < MIN_SIZE_VALUE ? MIN_SIZE_VALUE : numbered);
        }


        

        var btn = document.getElementById("saveBtn");
        btn.addEventListener("click", function() {
            Options.save();
        });

    },

    save : function() {

        var fontSize 	= document.getElementById('font-size');
        var fontFamily = document.getElementById('font-family');
        var size = document.getElementById('size');
        var sizeVal = Number(size.value);
        var sizeMessage = document.getElementById('sizeMessage');
        if (sizeVal < MIN_SIZE_VALUE || sizeVal > MAX_SIZE_VALUE) {
            sizeMessage.innerHTML 		= 'Max size = 600, Min size = 400';
            sizeMessage.style.display	= 'inline';
            if (sizeVal < MIN_SIZE_VALUE) {
                sizeVal = MIN_SIZE_VALUE;
            } else if (sizeVal > MAX_SIZE_VALUE) {
                sizeVal = MAX_SIZE_VALUE;
            }
        }
        // Store
        //this.data 				= localStorage['data'] ? JSON.parse(localStorage['data']) : this.data;
        this.data.options.fontSize 		= fontSize.value;
        this.data.options.fontFamily    = fontFamily.value;
        this.data.options.size 	        = size.value || MIN_SIZE_VALUE;

        localStorage['data']	= JSON.stringify(this.data);

        var say = document.getElementById('say');
        say.innerHTML 		= 'Saved';
        say.style.display	= 'inline';


        chrome.storage.sync.set({
            fontSize: fontSize.value,
            fontFamily: fontFamily.value,
            size : sizeVal > MAX_SIZE_VALUE ? MAX_SIZE_VALUE : (sizeVal < MIN_SIZE_VALUE ? MIN_SIZE_VALUE : sizeVal)
        }, function() {
            setTimeout(function() {
                say.style.display = 'none';
                sizeMessage.style.display = 'none';
            },3000);
        });

    },

    select	: function(what, value) {
        var select = document.getElementById(what);
        Array.prototype.slice.call(select.options).forEach(function(option, index) {
            if(option.value === value ) {
                select.selectedIndex = index;
            }
        });
    }

}



window.addEventListener('load', function() {
    Options.initialize();
});
