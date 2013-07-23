// modified from underscore
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

module.exports = function (opts) {
    var options = opts || {};
    var config = {
        syncTest: function () {},
        debounce: 300,
        handleResult: null,
        asyncTest: null,
        handleLoading: null,
        handleStopped: null
    };
    var vals = [];
    var result = {};
    var previousSetup = opts.setup;
    var item;


    // apply our options
    for (item in options) {
        // if not explicitly a config for this plugin, attach it to the field
        if (config.hasOwnProperty(item)) {
            config[item] = options[item];
        } else {
            result[item] = options[item];
        }
    }

    // this only happens when plugin is used incorrectly so we can throw
    if (!opts.asyncTest) throw new Error('You must pass an asyncTest function');
    if (!opts.handleResult) throw new Error('You must pass an handleResult callback');

    result.async = true;
    result.message = '';
    result.tests = [
        {
            test: function (val, form, cb) {
                var self = this;
                // if we've got basic syncronous tests that fail
                // set that message.
                if (self.ignoreSame && val === self.initial) {
                    config.handleResult.call(self, '');
                    if (cb) cb(true);
                    return;
                }

                testResult = config.syncTest(val);
                if (testResult) {
                    config.handleResult.call(self, false, testResult);
                    if (cb) cb(false);
                } else {
                    if (config.handleLoading) config.handleLoading.call(self, val);
                    config.asyncTest(val, function (available) {
                        if (config.handleStopped) config.handleStopped.call(self, val);
                        // we only want to make this determination if
                        // we're checking the value that's currently in the input
                        // otherwise the request is already old
                        if (val === self.inputEl.value) {
                            config.handleResult.call(self, available);
                        }
                        // this is the actual test when submitted, must be true
                        if (cb) cb(available === true);
                    });
                }
            },
            message: '',
            async: true
        }
    ];
    result.setup = function () {
        // "this" is the reformer "field" object
        var self = this;
        var container = $(this.fieldContainer).parent();

        container.delegate('input', 'keyup', debounce(function () {
            var val = $(this).val();
            if (val) {
                result.tests[0].test.call(self, val);
            } else {
                config.handleResult.call(self, '');
            }
        }, config.debounce));

        if (previousSetup) previousSetup.call(this);
    };

    return result;
};
