# Responsive ads, on _demand_!

### Responsive serving of ads based on viewport size!

---

#### ABOUT

This is The Register-Guard's solution to serving ads, on demand, based on viewport size.

At [The Register-Guard](http://www.registerguard.com), we built a "[responsive](http://en.wikipedia.org/wiki/Responsive_Web_Design)" template for the comprehensive redesign of our [site](http://www.registerguard.com).

Serving different ad creatives, and different ad sizes, at the various break points is a **mission critical** aspect of our redesign requirements (we even optimized our [grid](https://github.com/registerguard/wiffle) system to work with [IAB Standard Advertising Units](http://www.iab.net/ad_unit)).

Scan with phone and/or click to view the [latest demo](http://registerguard.github.com/ads-on-demand/master/):

[![qr code](http://chart.apis.google.com/chart?cht=qr&chl=https://github.com/registerguard/ads-on-demand&chs=240x240)](http://registerguard.github.com/ads-on-demand/master/)

Browse through the source code [here](https://github.com/registerguard/ads-on-demand/tree/gh-pages/master/).

---

#### BASICS

* *Ad Server:* [OpenX Enterprise](http://www.openx.com/publisher/enterprise-ad-server)
    * By default, this Ad Server is not setup to handle responsive ad inventory
* *[OpenX Inventory Basics](http://www.openx.com/docs/openx_help_center/content/conceptsinventory.html)*
* *Site Sectioning:*
    * Main Section with various sub-sections
    * News
        * Local News
        * Etc...
    * Sports
        * More...
    * etc...

---

#### SOLUTIONS

##### Un-Responsive Delivery Method:
Use the out-of-the box [ad unit group (AUG) tags](http://www.openx.com/docs/openx_help_center/content/adtagguide_synchjs_struct_page.html) on each and every separate template (we have approx. 50-75).

**In the Wild:**

Provided the ability for 1 server ping per page to request all the ads on that page, but is a lot of inventory management and overhead.


##### Responsive Delivery Method 1: *FAIL*
Create 2 AUGs per template (desktop ads, mobile ads) and use CSS `display:none` to show/hide ad positions… Unfortunately, while it might sound easy to impliment such a system, there are drawbacks:

**In the Wild:**

> From a functional perspective, your first instinct might be to use a simple display:none; in your stylesheet to hide bigger ads from showing up after a certain breakpoint. However, it’s not that easy.  
>   
> What happens here is that the ad code is still being loaded, the impressions are counted for the advertiser, but their ad isn’t being shown. Using display:none to hide some ads would result in skewed numbers and would definitely affect the performance of ad campaigns. Display: none; isn’t a solution, it just creates more problems.  
>   
> &mdash; [Adaptive Web-Design & Advertising](http://blog.buysellads.com/2012/01/adaptive-web-design-advertising/)

- - -

##### Responsive Delivery Method 2: *FAIL*
Just deliver the normal script ad tags with a `document.write` and all is right with the world&hellip; WRONG

**In the Wild:**

> It all boils down to Javascript's `document.write` command; unfortunately, if you call a script that uses this command (after the page has loaded) it will wipe out your page and only display the output of the write command.
>   
> If you you're building a responsive website, and you want your ads to change based on viewport size, then trying to call ad tags that use the `document.write` command just doesn't work.
>   
> I don't blame OpenX. The problem is deeper than that&hellip; Long story short, the online advertising industry needs to stop using `document.write`!
> &mdash; Micky Hulse


##### Responsive Delivery Method 3: *FAIL* 
Deliver every individual ad unit `<script>` tag with [writeCapture2()](https://github.com/iamnoah/writeCapture/tree/writeCapture2) & [onMediaQuery()](https://github.com/JoshBarr/js-media-queries) scripts

**In the Wild:**

A few months of research can be found via the [**defunct**](https://github.com/registerguard/ads-on-demand/tree/defunct) branch.

The bulk of the code in that branch used OpenX's `<script>` tag implimentation to serve ads to our pages.

Why did it all fail? Well, there's two primary reasons:

###### 1. Seriously crappy, third party, HTML and/or javascript!

The crap HTML and/or javascript was a huge problem for when it came to using [writeCapture](https://github.com/iamnoah/writeCapture) or [PostScribe](https://github.com/krux/postscribe/) plugins.

###### 2. The moving target that is OpenX's code base!

During a span of two months, OpenX changed their ad serving javascript twice! After each change, our code broke. This was extremely frustrating.

It's hard to leverage a system that changes on a regular basis&hellip; The last situation we wanted to be in was a Friday afternoon and all the ads across all of our sites were not serving.

After the second OpenX change, we shelved the `<script>` tag approach and went back to the drawing board&hellip;


##### Responsive Delivery Method 4: *SUCCESS*
Deliver every individual ad unit tag with [writeCapture2()](https://github.com/iamnoah/writeCapture/tree/writeCapture2) & [onMediaQuery()](https://github.com/JoshBarr/js-media-queries) scripts, but in the form of an`<iframe>` (can be injected after page-load and won't destroy the page)

We built a [Django app](https://github.com/registerguard/django-ad-manager) to help us serve our ads to our network of sites (via a wicked ah-some JSON call).

In situations where we can't use `<iframe>`s (e.g. a pushdown), we put our CSS's show/hide within the ad creative itself! The advantage here is that the ad gets counted only once! Though, the disadvantage is that we're loading twice the assets for any one viewport size/range.

**In the Wild:**

After many moons of research ([see below](https://github.com/registerguard/ads-on-demand#state-of-the-repo)) we ended up using `<iframe>`s to serve our ads.


##### Responsive Delivery Method 5: *BETTER SUCCESS*
* Deliver AUGs via OpenX's [asynchronous JS ad tags](http://www.openx.com/docs/openx_help_center/content/adtagguide_asynchjs.html) and kill the overhead of the [OnMediaQuery](https://github.com/registerguard/js-media-queries) JS and replace with [MatchMedia](https://github.com/paulirish/matchMedia.js/) JS.

> OpenX now supports asynchronous JavaScript ad tags for standalone, ad unit group, and multi-ad unit ad calls. Implementing these tags will decrease webpage load times; users won't have to wait for webpage content to load before ads display. Currently, you cannot generate these ad tags in the user interface; however, the documentation describes how to manually build them.
> &mdash; [OpenX Enterprise Release Notification](http://welcome.openx.com/index.php/email/emailWebview?mkt_tok=3RkMMJWWfF9wsRokuqXIZKXonjHpfsX84%2B0tWbHr08Yy0EZ5VunJEUWy2oIFTNQhcOuuEwcWGog8zxxdFPg%3D)

This code was extracted from this repo and lives [here](https://github.com/registerguard/benjamins)

---

#### RELATED REPOS

* [Django Ad Manager](https://github.com/registerguard/django-ad-manager): Django app to help manage, schedule and control OpenX ads from one server to another (this is what we actually use on our [live site](http://registerguard.com)).
* [Benjamins](https://github.com/registerguard/benjamins): Coming soon! We're moving the [Django Ad Manager javascript plugin (and other static assets)](https://github.com/registerguard/django-ad-manager/tree/b91036bf59b052499b21409a7db65b876a436782/ad_manager/static/ad_manager/1.0) to their own repository.

---

#### OTHER INFO

**Note:** At [The Register-Guard](http://www.registerguard.com), we use [OpenX Enterprise-level ad serving solutions for publishers](http://www.openx.com/publisher/enterprise-ad-server), so that's what the demo uses to serve the ads; fortunately, this repo's code, concepts and techniques should be easy to adapt to other ad serving software.

With that said, if you have questions/concerns/comments/other, please feel free to post them via [this repo's issue tracker](https://github.com/registerguard/ads-on-demand/issues).

---

#### DEBUG TOOLS

* [Virtual PC](http://www.microsoft.com/windows/virtual-pc/download.aspx)  
**Note:** I'd suggest clicking the "Don't need XP Mode and want VPC only? Download Windows Virtual PC without Windows XP Mode." link... XP Mode sounds like a headache. Always disable automatic updates so that the current version of IE doesn't get upgraded automatically.
    * [IE tester images](http://www.microsoft.com/en-us/download/details.aspx?id=11575).
    * [Installing Multiple Virtual PCs (XP Mode accepted)](http://ie.microsoft.com/testdrive/ieblog/2011/Feb/04_TestingMultipleVersionsofIEonOnePC_2.htm).
* [Adobe Flash DEBUG Player](http://www.adobe.com/support/flashplayer/downloads.html)
    * **Note:** Don't make the same mistake I did... Install Flash player on the VPC IE apps!
* Mac:
    * [Firebug](https://getfirebug.com/)
* PC:
    * [DebugBar](http://www.debugbar.com/): Free! Or paid... I've only used the free version.
        * [Companion.JS](http://www.my-debugbar.com/wiki/CompanionJS/HomePage): An awesome JS debugger for IE!
    * [Internet Explorer Developer Toolbar](http://www.microsoft.com/en-us/download/details.aspx?id=18359)
        * Small tip: When you have the IE Toolbar open, notice the menu item labled "Browser Mode"; switching modes can be helpful to catch JS errors.
    * [View Generated Source in IE6](http://wendt.se/blog/2011/07/25/view-generated-source-in-ie6/): A decent Bookmarklet for IE6.
    * [Fiddler](http://www.fiddler2.com/fiddler2/): Fiddler is a Web Debugging Proxy which logs all HTTP(S) traffic between your computer and the Internet.
    * [Firebug Lite](https://getfirebug.com/firebuglite/): Like Firebug for Firefox, but lighter. :)
    * Don't forget to turn on [script debugging](http://blogs.msdn.com/b/ie/archive/2004/10/26/247912.aspx) via the VPC IE apps!

---

#### LINKS & RESOURCES

* [OpenX Enterprise documentation](http://www.openx.com/docs/openx_help_center/)
* [Responsive Advertising: A Ranged Solution](http://artequalswork.com/posts/responsive-ads.php)
* [matchMedia() polyfill](https://github.com/paulirish/matchMedia.js/)
* [Responsive Web Design and JavaScript](http://seesparkbox.com/foundry/responsive_web_design_and_javascript)
* [Harvey - CSS media query state management](http://harvesthq.github.com/harvey/)
* [The state of responsive advertising: the publishers' perspective](http://www.netmagazine.com/features/state-responsive-advertising-publishers-perspective)
* [Adaptive Web-Design & Advertising](http://blog.buysellads.com/2012/01/adaptive-web-design-advertising/)
* [`WriteCapture2`](https://github.com/iamnoah/writeCapture/tree/writeCapture2)
* [`element.write`](https://github.com/iamnoah/element.write)
* [`onMediaQuery`](https://github.com/JoshBarr/js-media-queries), and here's [my fork](https://github.com/registerguard/js-media-queries)

---

#### LEGAL

Copyright &copy; 2013 [Micky Hulse](http://hulse.me), [Patrick Sullivan](http://psullivan6.com) / [The Register-Guard](http://www.registerguard.com)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License in the LICENSE file, or at:

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
