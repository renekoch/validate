define(['jquery'], function ($, helpers) {

	/**
	 *  # Rule defination
	 *
	 *  string: "<rulename>:<param1>:<param2>:<paramX>;<error message>"
	 *  object: {rule: "<rulename>", params: [<param1>, <param2>, <paramX>], msg: "<error message>"}
	 *  function: function(input: <value to check>, params: [<param1>, <param2>, <paramX>], msg: "<error message>")
	 *
	 *
	 *  # Usage
	 *
	 *  ## Event hook
	 *
	 *  $.validate(
	 *    <CSS selector>,    - which elements to hook on to. DEFAULT: [data-validate],
	 *    <rules>            - array of rules, *optional*. DEFAULT: element attribute data-validate
	 *  )
	 *
	 *
	 *  ## For single element
	 *
	 *  return array of errors messages, if empty array then <value> is valid
	 *
	 *  $(<CSS selector>).validate(
	 *    <rules>            - array of rules, *optional*. DEFAULT: element attribute data-validate
	 *  )
	 *
	 *
	 *  ## Plain JS
	 *
	 *  return array of errors messages, if empty array then <value> is valid
	 *
	 *  validate(
	 *    <value>,           - value to check
	 *    <rules>            - array of rules
	 *  )
	 */

	/**
	 * @typedef {Object} ValidateRule
	 * @property {string|function} rule
	 * @property {array} [params]
	 * @property {string} [msg]
	 */

	var VALIDATE = 'validate';

	/**
	 * Default Settings
	 *
	 * @type {Object}
	 */
	var DEFAULT = {
		rules: {
			size: function (input, params, msg) {
				var size = parseInt(params[0]);
				return (size && size != toStr(input).length) ? (msg || '').replace(/:size/g, size) : '';
			},
			min: function (input, params, msg) {
				var min = parseInt(params[0]);
				return (min && min > toStr(input).length) ? (msg || '').replace(/:min/g, min) : '';
			},
			max: function (input, params, msg) {
				var max = parseInt(params[0]);
				return (max && max < toStr(input).length) ? (msg || '').replace(/:max/g, max) : '';
			},
			between: function (input, params, msg) {
				params = [parseInt(params[0]), parseInt(params[1])];
				var
					min = Math.min(params),
					max = Math.max(params),
					len = toStr(input).length;

				return (min && max && (max < len || min > len)) ? (msg || '').replace(/:min/g, min).replace(/:max/g, max) : null;
			},
			number: function (input, params, msg) {
				return isNaN(parseFloat(input)) ? (msg || '') : null;
			},
			integer: function (input, params, msg) {
				return isNaN(parseInt(input)) ? (msg || '') : null;
			},
			zip: helperFN('zip'),
			name: helperFN('name'),
			email: helperFN('email'),
			icc: helperFN('email'),
			phonenumber: helperFN('phonenumber'),
			cpr: helperFN('cpr'),
			regno: helperFN('regno'),
			accountno: helperFN('accountno'),
			url: helperFN('url'),
			password: helperFN('password'),
			date: helperFN('date'),
			json: helperFN('json'),
			cvr: helperFN('cvr')
		},
		errors: {
			size: 'Skal være :size tegn',
			min: 'Minimum :min tegn',
			max: 'Miximum :max tegn',
			between: 'Skal være imellem :min og :max tegn',
			number: 'Ikke et tal',
			integer: 'Ikke et hel tal',
			zip: 'Ugyldigt postnr.',
			name: 'Ugyldigt navn',
			email: 'Ugyldig email',
			icc: 'Ugyldigt SIM-kort nr.',
			phonenumber: 'Ugyldigt nummer',
			cpr: 'Ugyldigt CPR nr.',
			regno: 'Ugyldigt Reg.nr.',
			accountno: 'Ugyldigt konto nr.',
			url: 'Ugyldig webadresse',
			password: 'Ugyldigt kodeord',
			date: 'Ugyldig dato',
			json: 'Ugyldig JSON',
			cvr: 'Ugyldigt CVR'

		},
		error_attr: 'data-error',
		events: 'input.' + VALIDATE + ',change.' + VALIDATE + ',click.' + VALIDATE
	};

	/**
	 * Output val as string
	 *
	 * @param {*} val
	 * @return {string}
	 */
	function toStr(val) {
		return (val == null ? '' : val) + '';
	}

	/**
	 * Create rule from helpers
	 *
	 * @param hlp
	 * @return {function(input: string, params: array, msg: string): string}
	 */
	function helperFN(hlp) {
		return function (input, params, msg) {
			return helpers[hlp](toStr(input)) ? null : (msg || '');
		};
	}

	/**
	 * Make sure rules are validfor validate
	 *
	 * @param {ValidateRule[]|string[]|function[]|string|function|Object|null} rules
	 * @return {ValidateRule[]}
	 */
	function cleanRules(rules) {
		return (rules ? ($.isArray(rules) ? rules : [rules]) : [])
			.map(function (data) {

				if ($.isFunction(data)) return [data, [], '', 'custom'];

				if (!$.isPlainObject(data)) {
					data = (data || '').match(/^([^;]+);?(.*?)$/);
					if (!data) return;
					data = {
						rule: data[1].trim(),
						msg: data[2].trim()
					};
				}
				var rule = data.rule;
				var params = data.params;

				if (!rule) return;

				if ($.isFunction(rule)) return [rule, params || [], data.msg || '', 'custom'];


				if (!params) {
					params = rule.split(":");
					rule = (params.splice(0, 1))[0];
				}

				var action = DEFAULT.rules[rule];
				if (!action) return;

				return [action, params, data.msg || DEFAULT.errors[rule] || '', rule];
			})
			.filter(function (a) {
				return a;
			});
	}

	/**
	 * Validate input against rules
	 *
	 * @param {string|Number} input                                                   - input to be validated
	 * @param {ValidateRule[]|string[]|function[]|string|function|Object|null} rules  - string format per rule is "<rulename>:param1:param2:paramX;error message"
	 * @param {bool} [cleaned]                                                        - true if rules are Pre cleaned *internal*
	 * @return {*}
	 */
	function validate(input, rules, cleaned) {
		rules = cleaned ? rules : cleanRules(rules);

		var errors = [];

		rules.forEach(function (rule) {
			var error = rule[0](input, rule[1], rule[2]);
			if (error) errors.push([error.replace(/:input/g, input).replace(/:param(\d+)/g, function (all, pos) {
				return rule[1][parseInt(pos) || 0];
			}), rule[3], rule[1]]);
		});

		return errors;
	}


	/**
	 * Run and display validate on input
	 *
	 * @param {jquery|{jquery:string}} input    - jquery element
	 * @param {ValidateRule[]} [rules]          - list of rules
	 * @return {string[]|null|false}
	 */
	function inputValidate(input, rules) {
		var
			id = input.attr('id'),
			errors = validate(input.val(), rules || input.data(VALIDATE), !!rules),
			evt = $.Event(VALIDATE, {valid: !errors.length, errors: errors});

		input.trigger(evt, [!errors.length, errors]);

		if (evt.isDefaultPrevented()) return;

		var err = errors.length ? errors[0][0] : '';

		input[0].setCustomValidity(err);
		input.next('label[for="' + id + '"]').attr(DEFAULT.error_attr, err);

		return errors.length ? errors : false;
	}

	/**
	 * jQuery version of validate usage : $('input').validate([rules])
	 *
	 * @param {ValidateRule[]|string[]|function[]|string|function|Object|null} rules  - string format per rule is "<rulename>:param1:param2:paramX;error message"
	 * @return {string[]|null|false}
	 */
	$.fn[VALIDATE] = function (rules) {
		return inputValidate(this.eq(0), rules ? cleanRules(rules) : null);
	};

	/**
	 * Hook validate event on selector
	 *
	 * @param {string|jquery|{jquery:string}} [selector]                              - selector string of jquery element
	 * @param {ValidateRule[]|string[]|function[]|string|function|Object|null} rules  - string format per rule is "<rulename>:param1:param2:paramX;error message"
	 */
	$[VALIDATE] = function (selector, rules) {

		var $hook = $(document);
		if (selector && selector.jquery) {
			$hook = selector;
			selector = null;
		}
		else if ($.isArray(selector)) {
			rules = selector;
			selector = null;
		}
		else {
			selector = selector || '[data-validate]';
		}

		rules = rules ? cleanRules(rules) : null;

		return $hook.on(DEFAULT.events, selector, function () {
			inputValidate($(this), rules);
		});
	};

	//Give access to default rules and error messages
	$.fn[VALIDATE].DEFAULT = $[VALIDATE].DEFAULT = validate.DEFAULT = DEFAULT;


	return validate;
});
