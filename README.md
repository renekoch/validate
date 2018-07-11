
# Rule defination
**string**: 

```javascript
"<rulename>:<param1>:<param2>:<paramX>;<error message>"
```

**object**: 

```javascript
{rule: "<rulename>", params: ["<param1>", "<param2>", "<paramX>"], msg: "<error message>"}
```

**function**: 
```javascript

function(
	input       // <value to check>, 
	params      // [<param1>, <param2>, <paramX>],
	msg         // "<error message>"
);
```
# Usage

## Event hook
```javascript
$.validate(
    <CSS selector>,   // which elements to hook on to. DEFAULT: [data-validate],
    <Rules>           // array of rules, *optional*. DEFAULT: element attribute data-validate
);
```

## For single element
return array of errors messages, if empty array then <value> is valid
```javascript
$(<CSS selector>).validate(
    <Rules>         // array of rules, *optional*. DEFAULT: element attribute data-validate
);
```

## Plain JS
return array of errors messages, if empty array then <value> is valid
```javascript
validate(
    <value>,  // value to check
    <Rules>   // array of rules
);
```
