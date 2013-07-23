# reformer-username

A plugin for [reformer](https://github.com/henrikjoreteg/reformer) to handle the super annoying problem of username validation testing while filling out a form.

The problems:

1. You want to run a debounced check as a user is typing into the field.
2. You want to validate that with some server-side check. But, you also have to account for the fact that results may come back out of order. So we only care about results for requests that checked the current data.
3. You want a hard enforcement check before submitting the form.
4. You want to support existing data in the form and not check if it's just the same value as when you started.
5. If it violates simple formatting rules you don't want to do the server-side check at all.
6. You want to be able to customize a message saying that the username they picked is, or isn't available.
7. You want to be able to show that container whenever something relevant is happening, but not if there's nothing wrong.
8. You want to be able to show a spinner or some type of loading graphic when the server checks are happening.


## Installing

You can grab it on npm and use it with browserify:

```
npm i reformer-username
```

Or just grab the file from `dist/reformer.usernamefield.js` which will work with AMD or as a standalone.


## How to use

```js
var profileForm = new Reformer({
    // pass existing data to form if it exists
    data: existingData,
    fields: [
        // our plugin returns a normal field definition
        // but with all our extra magic.
        // Any options you pass to the plugin that the
        // plugin doesn't use, simply gets passed onto
        // the field definition like reformer does normally.
        // So you can pass any valid field options in here too
        // such as the `fieldContainer` in this example or
        // a `setup` function, etc.
        reformerUsernameField({
            // normal field definition stuff
            name: 'username',
            label: 'Username',
            fieldContainer: $('.userNameField')[0],
            placeholder: 'helpy',
            // whether or not to test if we have the same value as
            // or initial data for the form.
            ignoreSame: true,

            // this will get called with the first argument being:
            //  - true if we checked and it's available
            //  - false if we checked and it's not available
            //  - '' if nothing has been entered, or if the value is unchanged from original data
            
            // so you might do something like what follows:
            handleResult: function (pass, passedMessage) {
                var message;
                var messageEl = $('#message');
                var messageWrapper = $('#messageWrap');

                if (pass === true) {
                    messageWrapper.show();
                    message = "Sweet, '" + this.value + "' is available!";
                    messageEl.removeClass('error').text(message);
                } else if (pass === false) {
                    messageWrapper.show();
                    message = passedMessage || "Sorry, '" + this.value + "' is taken.";
                    messageEl.addClass('error').text(message);
                } else {
                    messageEl.removeClass('error');
                    messageWrapper.hide();
                }
            },
            // whatever your actual serverside check is
            // the plugin will handle debouncing this and 
            // making sure only the correct result is used
            // It's just your job to supply the test that
            // takes the value and calls a callback
            asyncTest: function (val, cb) {
                $.get('/checkname?name=' + val, function (res) {
                    cb(res.available);
                });
            },
            // You can also supply a syncronous test. You should
            // return a string describing the error if it fails.
            syncTest: function (val) {
                if (!val.match(/^[a-zA-Z0-9_]+$/)) {
                    return 'Can only contain numbers, letters, and underscores.';
                }
            }
        }),
        // you just continue defining normal fields as follows
        {
            name: 'firstName',
            label: 'First name',
            placeholder: 'Helpy',
            fieldContainer: $('.firstNameContainer')[0],
            tests: [
                {
                    message: 'Must be less than 20 characters.',
                    test: function (val) {
                        return val.length <= 20;
                    }
                },
                {
                    message: 'Please enter your first name.',
                    test: function (val) {
                        return !!val.length;
                    }
                }
            ]
        }
    ],
    submit: function () {
        // our normal submit handler
    },
    error: function () {
        // normal global error handler
    }
};

// render our form
profileForm.render({
    formEl: $('form'),
    fieldContainer: $('.fields')
});
```

#misc

If you like this, follow [@HenrikJoreteg](http://twitter.com/henrikjoreteg) :)


#license

MIT
