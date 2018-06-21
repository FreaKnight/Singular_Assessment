App.Client = {
    AppID: '',

    Load: function (AppID) {
        var jqAppID = sj.GetAppCodeElem(AppID),
            jqSearchForm = jqAppID.sjFindElem('#ClientSearchForm'),
            jqResultsForm = jqAppID.sjFindElem('#ClientResultsForm');

        App.Client.AppID = AppID;

        //Controls Setup
        //**************
        jqResultsForm.hide();

        //Event Handlers
        //**************
        jqSearchForm.sjFindName('Search').on('click', function (event) {
            var jqMod = $(event.currentTarget).closest('[appcode]');

            App.Client.Search(jqMod);
        });

        jqSearchForm.sjFindName('Create').on('click', function (event) {
            var jqMod = $(event.currentTarget).closest('[appcode]');

            App.Client.Insert(jqMod);
        });

        jqResultsForm.sjFindName('del').on('click', function (event) {
            var jqThisCtrl = $(event.currentTarget),
                jqMod = jqThisCtrl.closest('[appcode]'),
                jqThisRow = jqThisCtrl.closest('tr'),
                data = {
                    ClientID: jqThisRow.sjFindName('ClientID').val()
                };

            event.preventDefault;
            event.stopPropagation;

            //TODO: dataValidator
            App.Client.Delete(jqMod, data);
        });

        jqResultsForm.sjFindName('edit').on('click', function (event) {
            var jqThisCtrl = $(event.currentTarget),
                jqMod = jqThisCtrl.closest('[appcode]'),
                jqThisRow = jqThisCtrl.closest('tr'),
                jqSpans = jqThisRow.sjFindElem('span', true);

            event.preventDefault;
            event.stopPropagation;

            if (jqThisCtrl.html() === 'Edit Client') {

                jqThisCtrl.html('Commit Changes');

                jqSpans.each(function (i, elem) {
                    var jqThisSpan = $(elem),
                        SpanName = jqThisSpan.attr('name'),
                        jqParentCell = jqThisSpan.closest('td'),
                        jqEditInput = $('<input type="text" name="' + SpanName + '" />'),
                        jqEditAddrType = $('<select name="AddrTypeCode" ddproc="usp_AddrTypeCode_dd"><option value = "">...none chosen...</option></select>');

                    jqThisSpan.hide();

                    if (SpanName === 'AddrDescr') {
                        sj.PopDropDown('Client', jqEditAddrType);

                        jqParentCell.append(jqEditAddrType);

                        if (jqThisSpan.html() === 'Residental') {
                            jqEditAddrType.val('R');
                        }
                        else if (jqThisSpan.html() === 'Business') {
                            jqEditAddrType.val('B');
                        }
                        else {
                            jqEditAddrType.val('');
                        }
                    }
                    else {
                        jqParentCell.append(jqEditInput);

                        jqParentCell.sjFindElem('input[name="' + SpanName + '"]').val(jqThisSpan.html());
                    }
                });
            }
            else {
                var data = {
                    ClientID: jqThisRow.sjFindName('ClientID').val()
                };

                jqThisCtrl.html('Edit Client');

                jqSpans.each(function (i, elem) {
                    var jqThisSpan = $(elem),
                        SpanName = jqThisSpan.attr('name'),
                        jqParentCell = jqThisSpan.closest('td'),
                        jqEditInput = jqParentCell.sjFindElem('input[name="' + SpanName + '"]', false, true),
                        jqEditAddrType = jqParentCell.sjFindElem('select[name="AddrTypeCode"]', false, true);

                    jqThisSpan.show();

                    if (SpanName === 'AddrDescr') {
                        data['AddrTypeCode'] = jqEditAddrType.val();

                        jqEditAddrType.remove();
                    }
                    else {
                        data[SpanName] = jqEditInput.val();

                        jqEditInput.remove();
                    }
                });

                //TODO: dataValidator
                App.Client.Update(jqMod, data);
            }
        });

        return jqSearchForm;
    },

    ValidateData: function (data) {
        //TODO: Validate data
    },

    Data: function (jqMod, data, CallBack) {
        var result = {};

        data.AppName = jqMod.attr('appcode');

        result = sj.SendData(data);

        if (result.Status !== undefined && result.Status === 'error') {
            alert(result.Msg);
        }
        else {
            //TODO: call loadJSON on Results form tr
            CallBack(jqMod, result);
        }
    },

    Select: function (jqMod) {

    },

    Search: function (jqMod) {
        var Proc = 'usp_Clients_sel',
            jqSearchForm = jqMod.sjFindElem('#ClientSearchForm'),
            data = jqSearchForm.serializeObject();

        data.Proc = Proc;

        App.Client.Data(jqMod, data, function (jqMod, result) {
            var jqResultsForm = jqMod.sjFindElem('#ClientResultsForm'),
                jqRow;

            jqResultsForm.sjFindElem('#ClientResultsTable tbody').sjTableClear();

            jqRow = jqResultsForm.sjFindElem('#ClientResultsTable tbody tr');

            jqRow.loadJSON(result.rowset);

            jqResultsForm.show();
        });
    },

    Insert: function (jqMod) {
        var Proc = 'usp_Clients_ins',
            jqSearchForm = jqMod.sjFindElem('#ClientSearchForm'),
            data = jqSearchForm.serializeObject(),
            notEmpty = true;
        
        for (var i in data) {
            if (data[i] === '') {
                alert('Please enter all the fields');
                return notEmpty = false;
            }
        }

        if (notEmpty) {
            data.Proc = Proc;

            App.Client.Data(jqMod, data, function (jqMod, result) {
                App.Client.Search(jqMod);
            });
        }
    },

    Update: function (jqMod, data) {
        var Proc = 'usp_Clients_upd';

        data.Proc = Proc;

        App.Client.Data(jqMod, data, function (jqMod, result) {
            App.Client.Search(jqMod);//<--This is to refesh the table so that the user can see that the changes reflect in the db
        });
    },

    Delete: function (jqMod, data) {
        var Proc = 'usp_Clients_del';

        data.Proc = Proc;

        App.Client.Data(jqMod, data, function (jqMod, result) {
            App.Client.Search(jqMod);//<--This is to refesh the table so that the user can see that the changes reflect in the db
        });
    }
}