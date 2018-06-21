(function ($) {

    $.fn.sjFindElem = function (selector, allowMulti, allowNone) {
        //Finds an element based on the css selector provided and whether to find multiple elements and to allow to find none
        var jqThis = $(this),
            jqFound = jqThis.find(selector);

        return privFindCheck(jqFound, selector, allowMulti, allowNone);
    };

    $.fn.sjFindName = function (selector, allowMulti, allowNone) {
        //Finds a element based on the name attribute
        var jqThis = $(this),
            jqFound = jqThis.find('[name="' + selector + '"]');

        return privFindCheck(jqFound, selector, allowMulti, allowNone);
    };

    function privFindCheck(jqFound, selector, allowMulti, allowNone) {
        allowMulti = (allowMulti === undefined) ? false : allowMulti;
        allowNone = (allowNone === undefined) ? false : allowNone;

        if (!allowNone && jqFound.length === 0) {
            throw new Error('No Elements found for ' + selector);
        }
        else if (!allowMulti && jqFound.length > 2) {
            throw new Error('Multiple Elements found for ' + selector);
        }
        else {
            return jqFound;
        }
    }

    $.fn.sjTableClear = function () {//<-- Extended on tbody element
        var jqTbody = $(this),
            jqAddRows = jqTbody.sjFindElem('tr', true).not(':first'),
            jqRow,
            jqCell;

        jqAddRows.remove();

        jqRow = jqTbody.sjFindElem('tr');
        jqCell = jqRow.sjFindElem('td span, td input', true);

        $.each(function (ii, elem) {
            var jqElem = $(elem);

            if (jqElem.is('input')) {
                jqElem.val('');
            }
            else if (jqElem.is('span')) {
                jqElem.html('');
            }
        });

    };

    $.fn.serializeObject = function () {
        var jqForm = $(this),
            jqCtrls = jqForm.find('input, select, textarea'), //<-- Can extend to find more
            data = {};

        if (!(jqForm.is('form'))) {
            throw new Error('No form was passed');
        }

        if (jqCtrls.length === 0) {
            throw new Error('No serializable controls found');
        }

        jqCtrls.each(function (idx, elem) {
            var jqElem = $(elem);

            if (jqElem.attr('name') === undefined) {
                throw new Error('Element does not have a Key associated');
            }

            data[jqElem.attr('name')] = jqElem.val();
        });

        return data;
    };

    $.fn.loadJSON = function (rowset) {
        var jqRow = $(this),
            jqTbody = jqRow.closest('tbody');

        if (rowset === undefined || rowset === null) {
            throw new Error('No data was supplied');
        }
        else if (rowset.length > 1 && jqRow.is('tr') === false) {
            throw new Error('A table.TR selector was required for binding this multiple row dataset');
        }

        $.each(rowset, function (i, row) {
            var clonedTR = jqRow.clone(true);

            $.each(row, function (colName, colValue) {
                var jqCtrl = jqRow.find('[name="' + colName + '"]');

                if (jqCtrl.is('span')) {
                    jqCtrl.html(colValue);
                }
                else if (jqCtrl.is('input')) {
                    jqCtrl.val(colValue);
                }
                else if (jqCtrl.is('img')) {
                    jqCtrl.attr('src', colValue);
                }
            });

            if (i < rowset.length - 1) {
                jqTbody.append(clonedTR);

                jqRow = jqTbody.find('tr').last();
            }
        });

    };

}(jQuery));