const EVENT_RUN_BEGIN = "start"
const EVENT_RUN_END = "end"
const EVENT_SUITE_BEGIN = "suite"
const EVENT_SUITE_END = "suite end"
const EVENT_TEST_FAIL = "fail"
const EVENT_TEST_PASS = "pass"
const EVENT_TEST_PENDING = "pending"

class VisualMochaReporter extends Mocha.reporters.Base {
    static statsTemplate = '<ul id="mocha-stats">' +
        '<li class="progress"><canvas width="40" height="40"></canvas></li>' +
        '<li class="passes"><a href="javascript:void(0);">passes:</a> <em>0</em></li>' +
        '<li class="failures"><a href="javascript:void(0);">failures:</a> <em>0</em></li>' +
        '<li class="duration">duration: <em>0</em>s</li>' +
        '</ul>'

    static playIcon = '&#x2023;'

    passes: HTMLElement
    failuresEl: HTMLElement
    duration: HTMLElement

    constructor(runner: Mocha.Runner, options: Mocha.MochaOptions) {
        super(runner, options)

        var self = this
        var stat = VisualMochaReporter.fragment(VisualMochaReporter.statsTemplate)
        var items = stat.getElementsByTagName('li')
        this.passes = items[1].getElementsByTagName('em')[0]
        var passesLink = items[1].getElementsByTagName('a')[0]
        this.failuresEl = items[2].getElementsByTagName('em')[0]
        var failuresLink = items[2].getElementsByTagName('a')[0]
        this.duration = items[3].getElementsByTagName('em')[0]
        var canvas = stat.getElementsByTagName('canvas')[0]
        var report = VisualMochaReporter.fragment('<ul id="mocha-report"></ul>')
        var stack = [report]
        var root = document.getElementById('mocha')

        /*
                if (canvas.getContext) {
                    var ratio = window.devicePixelRatio || 1;
                    canvas.style.width = canvas.width;
                    canvas.style.height = canvas.height;
                    canvas.width *= ratio;
                    canvas.height *= ratio;
                    ctx = canvas.getContext('2d');
                    ctx.scale(ratio, ratio);
                    progress = new Progress();
                }
        */
        if (!root) {
            return VisualMochaReporter.error('#mocha div missing, add it to your document');
        }

        // pass toggle
        VisualMochaReporter.on(passesLink, 'click', function(evt: Event) {
            evt.preventDefault();
            VisualMochaReporter.unhide();
            var name = /pass/.test(report.className) ? '' : ' pass';
            report.className = report.className.replace(/fail|pass/g, '') + name;
            if (report.className.trim()) {
                VisualMochaReporter.hideSuitesWithout('test pass');
            }
        })

        // failure toggle
        VisualMochaReporter.on(failuresLink, 'click', function (evt: Event) {
            evt.preventDefault()
            VisualMochaReporter.unhide()
            var name = /fail/.test(report.className) ? '' : ' fail'
            report.className = report.className.replace(/fail|pass/g, '') + name
            if (report.className.trim()) {
                VisualMochaReporter.hideSuitesWithout('test fail')
            }
        })

        root.appendChild(stat)
        root.appendChild(report)

        runner.on(EVENT_SUITE_BEGIN, (suite) => {
            console.log(`EVENT_SUITE_BEGIN ${suite.title}`)
            try {
                if (suite.root === undefined) {
                    return
                }

                var url = self.suiteURL(suite);
                var el = VisualMochaReporter.fragment(
                    '<li class="suite"><h1><a href="%s">%s</a></h1></li>',
                    url,
                    escape(suite.title)
                );

                // container
                stack[0].appendChild(el);
                stack.unshift(document.createElement('ul'))
                el.appendChild(stack[0])
            }
            catch (error) {
                console.log(error)
            }
        })

        runner.on(EVENT_SUITE_END, (suite: Mocha.Suite) => {
            console.log(`EVENT_SUITE_END ${suite.title}`)
            if (suite.root) {
                this.updateStats()
                return
            }
            stack.shift()
        })

        runner.on(EVENT_TEST_PASS, (test: any) => {
            console.log(`EVENT_TEST_PASS ${test.title} ${test.context}`)
            try {
                var url = this.testURL(test)

                var context = ""
                if (test.context !== undefined) {
                    context = test.context
                }

                var markup =
                    `<li class="test pass ${test.speed}"><h2>${test.title}<span class="duration">${test.duration}</span> ` +
                    `<a href="${url}" class="replay">` +
                    VisualMochaReporter.playIcon +
                    '</a><br/>'+context+'</h2></li>'
                
                var el = VisualMochaReporter.fragment(markup)
                this.addCodeToggle(el, test.body)
                VisualMochaReporter.appendToStack(stack, el)
                this.updateStats()
            }
            catch (error) {
                console.log(error)
            }
        });

        runner.on(EVENT_TEST_FAIL, (test: any) => {
            console.log(`EVENT_TEST_FAIL ${test.title} ${test.context}`)
            try {
                var el = VisualMochaReporter.fragment(
                    '<li class="test fail"><h2>%e <a href="%e" class="replay">' +
                    VisualMochaReporter.playIcon +
                    '</a></h2></li>',
                    test.title,
                    self.testURL(test)
                );
                var stackString; // Note: Includes leading newline
                var message = test.err.toString()

                // <=IE7 stringifies to [Object Error]. Since it can be overloaded, we
                // check for the result of the stringifying.
                if (message === '[object Error]') {
                    message = test.err.message
                }

                if (test.err.stack) {
                    var indexOfMessage = test.err.stack.indexOf(test.err.message);
                    if (indexOfMessage === -1) {
                        stackString = test.err.stack
                    } else {
                        stackString = test.err.stack.substr(
                            test.err.message.length + indexOfMessage
                        )
                    }
                } else if (test.err.sourceURL && test.err.line !== undefined) {
                    // Safari doesn't give you a stack. Let's at least provide a source line.
                    stackString = '\n(' + test.err.sourceURL + ':' + test.err.line + ')'
                }

                stackString = stackString || ''

                if (test.err.htmlMessage && stackString) {
                    el.appendChild(
                        VisualMochaReporter.fragment(
                            '<div class="html-error">%s\n<pre class="error">%e</pre></div>',
                            test.err.htmlMessage,
                            stackString
                        )
                    );
                } else if (test.err.htmlMessage) {
                    el.appendChild(
                        VisualMochaReporter.fragment('<div class="html-error">%s</div>', test.err.htmlMessage)
                    )
                } else {
                    el.appendChild(
                        VisualMochaReporter.fragment('<pre class="error">%e%e</pre>', message, stackString)
                    )
                }

                self.addCodeToggle(el, test.body)
                VisualMochaReporter.appendToStack(stack, el)
                this.updateStats()
            }
            catch (error) {
                console.log(error)
            }
        });

        runner.on(EVENT_TEST_PENDING, (test: any) => {
            var el = VisualMochaReporter.fragment(
                '<li class="test pass pending"><h2>%e</h2></li>',
                test.title
            );
            VisualMochaReporter.appendToStack(stack, el)
            this.updateStats()
        });
    }

    static appendToStack(stack: HTMLElement[], el: HTMLElement) {
        // Don't call .appendChild if #mocha-report was already .shift()'ed off the stack.
        if (stack[0]) {
            stack[0].appendChild(el)
        }
    }

    updateStats() {
        // // TODO: add to stats
        var percent = ((this.stats.tests / this.runner.total) * 100) | 0;
        // if (progress) {
        //   progress.update(percent).draw(ctx);
        // }

        // update stats
        var ms = new Date().getTime() - this.stats.start!!.getTime()!
        VisualMochaReporter.text(this.passes, `${this.stats.passes}`);
        VisualMochaReporter.text(this.failuresEl, `${this.stats.failures}`);
        VisualMochaReporter.text(this.duration, `${(ms / 1000).toFixed(2)}`);
    }

    /**
     * Makes a URL, preserving querystring ("search") parameters.
     *
     * @param {string} s
     * @return {string} A new URL.
     */
    static makeUrl(s: string): string {
        var search = window.location.search;

        // Remove previous grep query parameter if present
        if (search) {
            search = search.replace(/[?&]grep=[^&\s]*/g, '').replace(/^&/, '?')
        }

        return (
            window.location.pathname +
            (search ? search + '&' : '?') +
            'grep=' +
            encodeURIComponent(VisualMochaReporter.escapeRe(s))
        );
    }

    suiteURL(suite: Mocha.Suite) {
        return VisualMochaReporter.makeUrl(suite.fullTitle())
    }

    testURL(test: Mocha.Test) {
        return VisualMochaReporter.makeUrl(test.fullTitle())
    }

    addCodeToggle(el: HTMLElement, contents: string) {
        var h2 = el.getElementsByTagName('h2')[0];

        VisualMochaReporter.on(h2, 'click', function () {
            pre.style.display = pre.style.display === 'none' ? 'block' : 'none';
        })

        var pre = VisualMochaReporter.fragment('<pre><code>%e</code></pre>', VisualMochaReporter.clean(contents));
        el.appendChild(pre);
        pre.style.display = 'none'
    };

    static error(msg: string): any {
        document.body.appendChild(VisualMochaReporter.fragment('<div id="mocha-error">%s</div>', msg))
    }

    static escape(s: string) {
        return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    }

    static escapeRe(s: string) {
        return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    }

    static clean(str: string) {
        str = str
            .replace(/\r\n?|[\n\u2028\u2029]/g, '\n')
            .replace(/^\uFEFF/, '')
            // (traditional)->  space/name     parameters    body     (lambda)-> parameters       body   multi-statement/single          keep body content
            .replace(
                /^function(?:\s*|\s+[^(]*)\([^)]*\)\s*\{((?:.|\n)*?)\s*\}$|^\([^)]*\)\s*=>\s*(?:\{((?:.|\n)*?)\s*\}|((?:.|\n)*))$/,
                '$1$2$3'
            )

        var spaces = str.match(/^\n?( *)/)!![1].length
        var tabs = str.match(/^\n?(\t*)/)!![1].length
        var re = new RegExp(
            '^\n?' + (tabs ? '\t' : ' ') + '{' + (tabs || spaces) + '}',
            'gm'
        )

        str = str.replace(re, '')

        return str.trim()
    };


    /**
     * Return a DOM fragment from `html`.
     */
    static fragment(html: string, ...args: string[]): any {
        var div = document.createElement('div')
        var i = 0

        div.innerHTML = html.replace(/%([se])/g, function(_: string, ...type: any[]): string {
            switch (type[0]) {
                case 's':
                    return String(args[i++])
                case 'e':
                    return VisualMochaReporter.escape(args[i++])
                // no default
            }
            throw Error()
        });
        return div.firstChild
    }

    /**
     * Check for suites that do not have elements
     * with `classname`, and hide them.
     *
     * @param {text} classname
     */
    static hideSuitesWithout(classname: string) {
        var suites = document.getElementsByClassName('suite')
        for (var i = 0; i < suites.length; i++) {
            var els = suites[i].getElementsByClassName(classname)
            if (!els.length) {
                suites[i].className += ' hidden'
            }
        }
    }

    /**
     * Unhide .hidden suites.
     */
    static unhide() {
        var els = document.getElementsByClassName('suite hidden')
        while (els.length > 0) {
            els[0].className = els[0].className.replace('suite hidden', 'suite')
        }
    }

    /**
     * Set an element's text contents.
     */
    static text(el: HTMLElement, contents: string) {
        if (el.textContent) {
            el.textContent = contents
        } else {
            el.innerText = contents
        }
    }

    /**
     * Listen on `event` with callback `fn`.
     */
    static on(el: HTMLElement, event: string, fn: any) {
        //if (el.addEventListener) {
        el.addEventListener(event, fn, false)
        //} //else {
        //    el.attachEvent('on' + event, fn);
        //}
    }

}
