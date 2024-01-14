const feedBackQuestionObj = {
    'Q1': {
        'question': `Would if be useful to have a <b>mobile app for Notepad</b>?`,
        'inputType': 'radio',
        'options':['Yes', 'No'],
        'optionsLink': {
            'yes':'Q2',
            'no': 'Q4'
        }
    },
    'Q2':{
        'question': '<b>Great!</b> In what way would the mobile app be useful?',
        'inputType': 'textarea',
        'options':[],
        'optionsLink': null,
        'nextQues': 'Q3'
    },
    'Q3':{
        'question': 'What is the OS of your mobile phone?',
        'inputType': 'checkbox',
        'options':['Android', 'iOS'],
        'optionsLink': null,
        'nextQues': null
    },
    'Q4':{
        'question': `Alright! You have <b>feedback on the Notepad extension</b>?`,
        'inputType': 'textarea',
        'options':[],
        'optionsLink': null,
        'nextQues': null
    }
};

const formTemplate = '' + `<div id="mobile-feedback-form" title="">
                            <div class="content">
                                <div class="formContent">
                                    <div class="feedback-question"></div>
                                    <div class="feedback-answer"></div>
                                    <div class="feedback-thanks">Thank you!</div>
                                </div>
                                <div class="formFooter">
                                    <span class="footerArrow" title="Next question">&#8594;</span>
                                    <input type="button" class="feedback-close" value="Close"/>
                                </div>
                              </div>
                            </div>`;

var MobileFeedBackView = {
    init: function init ($el,container) {
        this.$el = $el.append(formTemplate);
        // initially it will always from Q1
        this.showQuestion("Q1");
        this.showDilaog(container);
    },

    bindEvents: function(){
        this.$el.find('.mobileapp-qtntype-optn').off('click').on("click", ($event)=>{
            const selectedVal = $event.target.value;
             this.currentQuestnNumber = $event.target.getAttribute('data-qnum');
             if(selectedVal.toLowerCase() === 'yes' || selectedVal.toLowerCase() === 'no'){
                 this.questionNumberToShow = feedBackQuestionObj[this.currentQuestnNumber].optionsLink[selectedVal.toLowerCase()]
             }else{
                 this.questionNumberToShow = feedBackQuestionObj[this.currentQuestnNumber].optionsLink;
             }
             this.value = selectedVal;
        });
        this.$el.find('.mobileapp-qtntype-input').off('keyup').on('keyup', ($event) =>{
            this.currentQuestnNumber = $event.target.getAttribute('data-qnum');
            this.questionNumberToShow = feedBackQuestionObj[this.currentQuestnNumber].nextQues;
            this.value = $event.target.value;
        });

        this.$el.find('.mobileapp-qtntype-multiple-optn-selectn').off('click').on('click', ($event)=>{
            this.currentQuestnNumber = $event.target.getAttribute('data-qnum');
            if($event.currentTarget.checked){
                if(this.value instanceof Array){
                    this.value.push($event.target.value)
                }else{
                    this.value = [$event.target.value];
                }
            }else{
                this.value.splice(this.value.indexOf($event.target.value), 1);
            }
            this.questionNumberToShow = feedBackQuestionObj[this.currentQuestnNumber].nextQues;
        });

        this.$el.find('.footerArrow').off('click').on('click', ()=>{  // (Question , answered, value)
            const displayQuestionHasLinkedToAnotherQuestion = feedBackQuestionObj[this.currentQuestnNumber].optionsLink || feedBackQuestionObj[this.currentQuestnNumber].nextQues;
            if(!displayQuestionHasLinkedToAnotherQuestion && this.value){
                this.$el.find('.feedback-thanks').show();
                this.$el.find('.feedback-close').show(); // feedback-question, feedback-answer
                this.$el.find('.feedback-question').hide();
                this.$el.find('.feedback-answer').hide();
                this.$el.find('.footerArrow').hide();
            }
            if(this.value && this.value.length){
                if(this.value instanceof Array && this.value.length){
                    for(let i = 0; i<this.value.length; i++){
                        Utils.trackGoogleEvent('_trackEvent', feedBackQuestionObj[this.currentQuestnNumber].question, 'answered', this.value[i]);
                    }
                }else{
                    Utils.trackGoogleEvent('_trackEvent', feedBackQuestionObj[this.currentQuestnNumber].question, 'answered', this.value);
                }
                this.showQuestion(this.questionNumberToShow);
            }
        });
        this.$el.find('.feedback-close').off('click').on("click", ()=>{
            chrome.storage.sync.set({
                'isMobileFeedBackFormSubmitted': true
            })
            this.$el.find("#mobile-feedback-form").dialog('close');
        });

    },

    showQuestion(questionNumberToShow){
        if(!questionNumberToShow){
            return;
        }
        let inputType = feedBackQuestionObj[questionNumberToShow].inputType;
        const inputTypeTemplate = MobileFeedBackView.getInputTypeTemplate(questionNumberToShow, inputType, feedBackQuestionObj[questionNumberToShow].options) // initially it will always from Q1
        this.$el.find('.feedback-question').html(feedBackQuestionObj[questionNumberToShow].question);
        this.$el.find('.feedback-answer').empty().append(inputTypeTemplate);
        this.currentQuestnNumber = questionNumberToShow;
        this.value = null;
        this.bindEvents();
    },

    getInputTypeTemplate: function (questionNum, type, options) {
        let temp = '';
        switch (type){
            case 'radio':
                for(let i = 0; i<options.length; i++) {
                    temp = temp + `<input type="radio" data-qnum=${questionNum}   class="mobileapp-qtn-form-ele mobileapp-qtntype-optn" name="like_mobileapp" value=${options[i]}>
                                    <label for="mobile_app">${options[i]}</label> &nbsp;&nbsp;`
                }
                break;
            case 'checkbox':
                for(let i = 0; i<options.length; i++) {
                    temp = temp + `<input type="checkbox" data-qnum=${questionNum}   class="mobileapp-qtn-form-ele mobileapp-qtntype-multiple-optn-selectn" name="like_mobileapp" value=${options[i]}>
                                    <label for="mobile_app">${options[i]}</label> &nbsp;&nbsp;`
                }
                break;
            case 'number':
                temp = `<input type="number" name="pay_mobileapp" data-qnum=${questionNum}  class="mobileapp-qtn-form-ele mobileapp-qtntype-number" min="100" max="1000">`;
                break;
            default:
                temp = `<textarea type="text" name="default_type" data-qnum=${questionNum}  rows="1" cols="35" maxlength="180" class="mobileapp-qtn-form-ele mobileapp-qtntype-input"></textarea>`;
        }
        return temp;
    },

    showDilaog: function showDialog ($where) {
        if ( !this._dialog ) {
            this._dialog = this.$el.find("#mobile-feedback-form").dialog({
                title: "Survey",
                autoOpen: false,
                appendTo: $where,
                modal: true,
                width: 385,
                close: function() {

                }
            }).css('top','45%');
            this._dialog.dialog("open");
        }
        this._dialog.dialog("open");
    }
};
