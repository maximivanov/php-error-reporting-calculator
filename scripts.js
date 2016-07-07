(function (root) {
    'use strict';

    root.onload = function () {
        var config = {
            versions:                {
                '5.4':   '5.4.* and higher',
                '5.3':   '5.3.*',
                '5.2':   '5.2.*',
                '5.0':   '5.0.* - 5.1.*',
                'pre_5': 'Pre 5.*'
            },
            constants:               {
                'E_ERROR':             {
                    value:       1,
                    description: 'Fatal run-time errors. These indicate errors that can not be recovered from, such as a memory allocation problem. Execution of the script is halted.'
                },
                'E_WARNING':           {
                    value:       2,
                    description: 'Run-time warnings (non-fatal errors). Execution of the script is not halted.'
                },
                'E_PARSE':             {
                    value:       4,
                    description: 'Compile-time parse errors. Parse errors should only be generated by the parser.'
                },
                'E_NOTICE':            {
                    value:       8,
                    description: 'Run-time notices. Indicate that the script encountered something that could indicate an error, but could also happen in the normal course of running a script.'
                },
                'E_CORE_ERROR':        {
                    value:       16,
                    description: 'Fatal errors that occur during PHP\'s initial startup. This is like an E_ERROR, except it is generated by the core of PHP.'
                },
                'E_CORE_WARNING':      {
                    value:       32,
                    description: 'Warnings (non-fatal errors) that occur during PHP\'s initial startup. This is like an E_WARNING, except it is generated by the core of PHP.'
                },
                'E_COMPILE_ERROR':     {
                    value:       64,
                    description: 'Fatal compile-time errors. This is like an E_ERROR, except it is generated by the Zend Scripting Engine.'
                },
                'E_COMPILE_WARNING':   {
                    value:       128,
                    description: 'Compile-time warnings (non-fatal errors). This is like an E_WARNING, except it is generated by the Zend Scripting Engine.'
                },
                'E_USER_ERROR':        {
                    value:       256,
                    description: 'User-generated error message. This is like an E_ERROR, except it is generated in PHP code by using the PHP function trigger_error().'
                },
                'E_USER_WARNING':      {
                    value:       512,
                    description: 'User-generated warning message. This is like an E_WARNING, except it is generated in PHP code by using the PHP function trigger_error().'
                },
                'E_USER_NOTICE':       {
                    value:       1024,
                    description: 'User-generated notice message. This is like an E_NOTICE, except it is generated in PHP code by using the PHP function trigger_error().'
                },
                'E_STRICT':            {
                    value:       2048,
                    description: 'Enable to have PHP suggest changes to your code which will ensure the best interoperability and forward compatibility of your code.'
                },
                'E_RECOVERABLE_ERROR': {
                    value:       4096,
                    description: 'Catchable fatal error. It indicates that a probably dangerous error occurred, but did not leave the Engine in an unstable state. If the error is not caught by a user defined handle (see also set_error_handler()), the application aborts as it was an E_ERROR.'
                },
                'E_DEPRECATED':        {
                    value:       8192,
                    description: 'Run-time notices. Enable this to receive warnings about code that will not work in future versions.'
                },
                'E_USER_DEPRECATED':   {
                    value:       16384,
                    description: 'User-generated warning message. This is like an E_DEPRECATED, except it is generated in PHP code by using the PHP function trigger_error().'
                }
            },
            versionsToConstants:     {},
            versionsToEAllConstants: {},
            getMaxLevelByVersion:    function getMaxLevelByVersion(version) {
                var level = 0;
                config.versionsToConstants[version].forEach(function (constant) {
                    level = level | config.constants[constant].value;
                });

                return level;
            },
            getEAllLevelByVersion:   function getEAllLevelByVersion(version) {
                var level = 0;
                config.versionsToEAllConstants[version].forEach(function (constant) {
                    level = level | config.constants[constant].value;
                });

                return level;
            },
            getConstantsByLevel:     function getConstantsByLevel(level) {
                return Object.keys(config.constants).filter(function (constant) {
                    return config.isConstantSetInLevel(level, constant);
                });
            },
            isConstantSetInLevel:    function isConstantSetInLevel(level, constant) {
                var value = config.constants[constant].value;

                return (level & value) === value;
            }
        };

        config.versionsToConstants['pre_5'] = ['E_ERROR', 'E_WARNING', 'E_PARSE', 'E_NOTICE', 'E_CORE_ERROR', 'E_CORE_WARNING', 'E_COMPILE_ERROR', 'E_COMPILE_WARNING', 'E_USER_ERROR', 'E_USER_WARNING', 'E_USER_NOTICE'];
        config.versionsToConstants['5.0'] = config.versionsToConstants['pre_5'].concat(['E_STRICT']);
        config.versionsToConstants['5.2'] = config.versionsToConstants['5.0'].concat(['E_RECOVERABLE_ERROR']);
        config.versionsToConstants['5.3'] = config.versionsToConstants['5.2'].concat(['E_DEPRECATED', 'E_USER_DEPRECATED']);
        config.versionsToConstants['5.4'] = config.versionsToConstants['5.3'];

        config.versionsToEAllConstants['pre_5'] = config.versionsToConstants['pre_5'];
        config.versionsToEAllConstants['5.0'] = config.versionsToConstants['5.0'].slice();
        config.versionsToEAllConstants['5.0'].splice(config.versionsToEAllConstants['5.0'].indexOf('E_STRICT'), 1);
        config.versionsToEAllConstants['5.2'] = config.versionsToConstants['5.2'].slice();
        config.versionsToEAllConstants['5.2'].splice(config.versionsToEAllConstants['5.2'].indexOf('E_STRICT'), 1);
        config.versionsToEAllConstants['5.3'] = config.versionsToConstants['5.3'].slice();
        config.versionsToEAllConstants['5.3'].splice(config.versionsToEAllConstants['5.3'].indexOf('E_STRICT'), 1);
        config.versionsToEAllConstants['5.4'] = config.versionsToConstants['5.4'];

        var selectedLevel;
        var maxLevel;
        var eAllLevel;

        var selectedLevelChangedEvent = document.createEvent('Event');
        selectedLevelChangedEvent.initEvent('changeSelectedLevel', true, true);

        var versionWidget = (function (config, document, widgetDom) {
            var selectDom = widgetDom.querySelector('.erlc-version__select');
            var onChangeHandlers = [];

            Object.keys(config.versions).forEach(function (versionKey) {
                var option = document.createElement('option');
                option.value = versionKey;
                option.textContent = config.versions[versionKey];

                selectDom.appendChild(option);
            });

            function applyOnChangeHandlers() {
                var version = selectDom.value;

                onChangeHandlers.forEach(function (handler) {
                    handler.call(this, version);
                });
            }

            selectDom.addEventListener('change', applyOnChangeHandlers);

            return {
                addOnChangeHandler: function (handler) {
                    onChangeHandlers.push(handler);
                },
                init:               function init() {
                    applyOnChangeHandlers();
                }
            };
        }(config, root.document, root.document.querySelector('.erlc-version')));

        var constantsWidget = (function (config, document, widgetDom) {
            function resetWidget() {
                while (widgetDom.firstChild) {
                    widgetDom.removeChild(widgetDom.firstChild);
                }
            }

            function addConstant(constant, value, description) {
                var constantDom = document.createElement('code');
                constantDom.setAttribute('data-value', value);
                constantDom.classList.add('erlc-constants__constant');

                var checkboxDom = document.createElement('input');
                checkboxDom.classList.add('erlc-constants__constant-checkbox');
                checkboxDom.type = 'checkbox';
                checkboxDom.id = 'value-' + value;
                constantDom.appendChild(checkboxDom);

                var labelDom = document.createElement('label');
                labelDom.classList.add('erlc-constants__constant-label');
                labelDom.htmlFor = checkboxDom.id;
                labelDom.textContent = constant;
                constantDom.appendChild(labelDom);
                constantDom.appendChild(document.createTextNode(' '));

                var valueDom = document.createElement('span');
                valueDom.classList.add('erlc-constants__constant-value');
                valueDom.textContent = value;
                constantDom.appendChild(valueDom);

//                            var descriptionDom = document.createElement('div');
//                            descriptionDom.classList.add('erlc-constants__constant-description');
//                            descriptionDom.textContent = description;
//                            constantDom.appendChild(descriptionDom);

                widgetDom.appendChild(constantDom);

                checkboxDom.addEventListener('click', function (event) {
                    var element = event.target;

                    while (element && !element.classList.contains('erlc-constants__constant')) {
                        element = element.parentNode;
                    }

                    element.classList.toggle('erlc-constants__constant--selected');
                    var value = Number(element.getAttribute('data-value'));

                    if (element.classList.contains('erlc-constants__constant--selected')) {
                        selectedLevel = selectedLevel | value;
                    } else {
                        selectedLevel = selectedLevel & ~value;
                    }
                    element.dispatchEvent(selectedLevelChangedEvent);

                    event.stopPropagation();
                });
            }

            function render() {
                var nodeList = widgetDom.querySelectorAll('.erlc-constants__constant');
                var constantsDom = Array.prototype.slice.call(nodeList);

                constantsDom.forEach(function (constantDom) {
                    var value = Number(constantDom.getAttribute('data-value'));
                    var isConstantSet = (selectedLevel & value) === value;
                    var checkboxDom = constantDom.querySelector('input');

                    if (isConstantSet) {
                        constantDom.classList.add('erlc-constants__constant--selected');
                        checkboxDom.checked = true;
                    } else {
                        constantDom.classList.remove('erlc-constants__constant--selected');
                        checkboxDom.checked = false;
                    }
                });
            }

            return {
                showAvailableConstants: function showAvailableConstants() {
                    resetWidget();

                    config.getConstantsByLevel(maxLevel).forEach(function (constant) {
                        addConstant(constant, config.constants[constant].value, config.constants[constant].description);
                    });

                    addConstant('E_ALL', eAllLevel, 'All errors and warnings, as supported, except of level E_STRICT prior to PHP 5.4.0.');
                },
                render:                 render,
                getWidgetDom:           function getWidgetDom() {
                    return widgetDom;
                }
            };
        }(config, root.document, root.document.querySelector('.erlc-constants')));

        var levelWidget = (function (config, widgetDom) {
            var inputDom = widgetDom.querySelector('.erlc-level__input');

            inputDom.addEventListener('keyup', function onKeyUp() {
                var inputLevel = inputDom.value;

                if (isLevelValid(inputLevel)) {
                    selectedLevel = inputLevel;
                } else {
                    selectedLevel = 0;
                }
                widgetDom.dispatchEvent(selectedLevelChangedEvent);
            });

            function isLevelValid(level) {
                Object.keys(config.constants).forEach(function (constant) {
                    var value = config.constants[constant].value;

                    level = level & ~value;
                });

                return level === 0;
            }

            return {
                render:       function () {
                    inputDom.value = selectedLevel;
                },
                getWidgetDom: function getWidgetDom() {
                    return widgetDom;
                }
            };
        }(config, root.document.querySelector('.erlc-level')));

        var previewWidget = (function (config, widgetDom) {
            var errorReportingPreviewDom = widgetDom.querySelector('.erlc-preview__item--error-reporting .erlc-preview__item-value');
            var phpIniPreviewDom = widgetDom.querySelector('.erlc-preview__item--php-ini .erlc-preview__item-value');
            var htaccessPreviewDom = widgetDom.querySelector('.erlc-preview__item--htaccess .erlc-preview__item-value');

            function getConstantsString(level) {
                var constants = config.getConstantsByLevel(level);

                var constantsString = '';
                if (constants.length > Object.keys(config.constants).length / 2) {
                    var maxLevelConstants = config.getConstantsByLevel(maxLevel);
                    constantsString = 'E_ALL';

                    maxLevelConstants.forEach(function (constant) {
                        if (constants.indexOf(constant) !== -1) {
                            if (!config.isConstantSetInLevel(eAllLevel, constant)) {
                                constantsString += ' | ' + constant;
                            }
                        } else {
                            if (config.isConstantSetInLevel(eAllLevel, constant)) {
                                constantsString += ' & ~' + constant;
                            }
                        }
                    });
                } else {
                    constantsString = constants.join(' | ');
                }

                return constantsString;
            }

            return {
                render: function render() {
                    var constantsString = getConstantsString(selectedLevel) || 0;

                    errorReportingPreviewDom.textContent = constantsString;
                    phpIniPreviewDom.textContent = constantsString;
                    htaccessPreviewDom.textContent = selectedLevel;
                }
            };
        }(config, root.document.querySelector('.erlc-preview')));

        root.document.addEventListener('changeSelectedLevel', function (event) {
            [constantsWidget, levelWidget, previewWidget].forEach(function (widget) {
                var widgetDom = widget.getWidgetDom && widget.getWidgetDom();
                if (!widgetDom || widgetDom !== event.target) {
                    widget.render();
                }
            });
        });

        versionWidget.addOnChangeHandler(function (version) {
            maxLevel = config.getMaxLevelByVersion(version);
            eAllLevel = config.getEAllLevelByVersion(version);
            constantsWidget.showAvailableConstants();

            selectedLevel = maxLevel;
            root.document.dispatchEvent(selectedLevelChangedEvent);
        });

        versionWidget.init();
    };
}(window));
