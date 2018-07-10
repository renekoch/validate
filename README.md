
# Rule defination
````
string: "<rulename>:<param1>:<param2>:<paramX>;<error message>"
object: {rule: "<rulename>", params: [<param1>, <param2>, <paramX>], msg: "<error message>"}
function: function(
            input: <value to check>, 
            params: [<param1>, <param2>, <paramX>],
            msg: "<error message>"
          )
````
# Usage

## Event hook
````javascript
$.validate(
  <CSS selector>,    //- which elements to hook on to. DEFAULT: [data-validate],
  <rules>            //- array of rules, *optional*. DEFAULT: element attribute data-validate
)
````

## For single element
return array of errors messages, if empty array then <value> is valid
````javascript
$(<CSS selector>).validate(
  <rules>            // - array of rules, *optional*. DEFAULT: element attribute data-validate
)
````

## Plain JS
return array of errors messages, if empty array then <value> is valid
````javascript
validate(
  <value>,           //- value to check
  <rules>            //- array of rules
)
````
