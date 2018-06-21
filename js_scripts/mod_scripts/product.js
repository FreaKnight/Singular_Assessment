App.Product = {
    AppID: '',

    Load: function (AppID) {
        var jqAppID = sj.GetAppCodeElem(AppID),
            jqResultsForm = jqAppID.sjFindElem('#ProductResultsForm');

        App.Product.AppID = AppID;

        jqResultsForm.sjFindName('ClientID').on('change', function (event) {
            var jqClientID = $(event.currentTarget), 
                jqThisRow = jqClientID.closest('tr'),
                jqMod = jqThisRow.closest('[appcode]'),
                data = {
                    ClientID: jqClientID.val(),
                    ProductID: jqThisRow.sjFindName('ProductID').val()
                };

            App.Product.AddToBasket(jqMod, data);
        });

        return jqResultsForm;
    },

    ValidateData: function (data) {

    },

    Data: function (jqMod, data, CallBack) {
        var result = {};

        data.AppName = jqMod.attr('appcode');

        result = sj.SendData(data);

        if (result.Status !== undefined && result.Status === 'error') {
            alert(result.Msg);
        }
        else {
            CallBack(jqMod, result);
        }
    },

    Select: function (jqMod) {
        var data = {
            Proc: 'usp_Products_sel'
        };

        App.Product.Data(jqMod, data, function (jqMod, result) {
            var jqResultsForm = jqMod.sjFindElem('#ProductResultsForm'),
                jqRow;

            jqResultsForm.sjFindElem('#ProductResultsTable tbody').sjTableClear();

            jqRow = jqResultsForm.sjFindElem('#ProductResultsTable tbody tr');

            jqRow.loadJSON(result.rowset);

            jqResultsForm.show();
        });
    },

    AddToBasket: function (jqMod, data) {
        var Proc = 'usp_ClientBasket_ins';

        data.Proc = Proc;

        App.Product.Data(jqMod, data, function (jqMod, result) {
            var rowset = result.rowset[0];

            alert('Product: ' + rowset.Product + ' was successfully added to Client: ' + rowset.Client + '\'s basket');
        });
    }
}