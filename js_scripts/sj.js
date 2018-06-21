var App = {};

var sj = {

    GetAppCodeElem: function (AppCode) {
        //Gets the component/module's contianing div
        //Used to define the scope of the module in the dom
        //This ensures that only the elements of the module get found and worked on
        //incase of reusing names for controls across modules
        var AppMod = $('div[appcode="' + AppCode + '"]');

        if (AppMod.length === 0) {
            throw new Error('Could not find the app module');
        }

        return AppMod;
    },

    Nav: function (hash, jqModule) {
        //Navigation routine from menu click
        var AppCode = hash.substring(1, hash.length),
            strPath = '../' + (hash === '#index' ? '' : 'Modules/') + AppCode + '.html';

        if (hash === '#index') {
            //Just clear out the jqModule
            return;
        }
        else {
            sj.LoadModule(AppCode, jqModule);
        }
    },

    LoadModule: function (AppCode, jqPlaceHolder) {
        var strPath = '../Modules/' + AppCode + '.html';

        jqPlaceHolder.append('<div appcode="' + AppCode + '"></div>');

        jqPlaceHolder.sjFindElem('div[appcode="' + AppCode + '"]', false).load(strPath, function (response, status, xhr) {
            var jqModule = $(this);

            if (status === 'error') {
                jqModule.html(response);
            }
            else {
                var objApp = App[AppCode],
                    jqForm = objApp.Load(jqModule.attr('AppCode'));
                
                sj.SetupModule(AppCode, jqForm);
            }
        });
    },

    SetupModule: function (AppCode, jqForm) {
        //Find selects with a ddproc attr
        var jqCtrls = jqForm.sjFindElem('select[ddproc]');
        
        jqCtrls.each(function (idx, elem) {
            sj.PopDropDown(AppCode, $(elem));
        });

        App[AppCode].Select(sj.GetAppCodeElem(AppCode));
    },
    
    PopDropDown: function (AppCode, jqCtrl) {
        var data = {
                AppName: AppCode,
                Proc: jqCtrl.attr('ddproc')
            },
            jsonData = sj.SendData(data);

        //create options based off of the result set
        if (jsonData !== 'error') {
            var rowset = jsonData.rowset;

            for (var i in rowset) {
                var optVals = rowset[i],
                    optStr = '<option value="' + optVals.value + '">' + optVals.label + '</option>';

                jqCtrl.append(optStr);
            }
        }
    },
    
    SendData: function (data, elem, callBack) {
        var result,
            options = {
                type: "GET",
                url: "../sj_server_code/DDAL.aspx",
                async: false,
                traditional: true,
                data: data
            };

        $.ajax(options)
            .done(function (data, textStatus, jqXHR) {
                result = data;
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseJSON !== undefined) {
                    result = {
                        Status: 'error',
                        Msg: jqXHR.responseJSON.Message
                    };
                }
                else {
                    result = {
                        Status: 'error'
                    };
                }
            });

        return result;
    }
};
