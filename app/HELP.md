# Links

[Webpage](https://quxios.github.io/#/)

[Github Repo](https://github.com/quxios/QMapEditor)


# About

This application allows you to store your favorite RPGMaker MV plugins in the apps folder, which you can access at anytime. With this app you view plugins help and it you can view it formatted in MD or plain text! There's also a built in update checker that will inform you if a plugin is outdated (Plugins need to provide additional information for this to work though, see next section for details)!

# For Developers
## Additional Plugin Headers

Here's a list of new plugin headers that are used in this app. These headers have no effect in RPGMakerMV by default.
~~~js
// @site URL
// @version X.Y.Z
// @updateurl URL
~~~
**@site** property is used to provide a link to your site

**@version** property is used for the update checker. The values need to be a number but can be in any format. Ex; X.Y is fine and so is X.Y.Z.W as long as they are all integers

**@updateurl** property is used for the update checker. This url should link to a json file. The json file can return an array or an object.

**@updateurl** json array format:
~~~json
 [
   {"name": "pluginNameA", "version": "X.Y.Z", "download": "URL where this plugin can be found"},
   ...,
   {"name": "pluginNameZ", "version": "X.Y.Z", "download": "URL where this plugin can be found"}
 ]
~~~

**@updateurl** json object format:
~~~json
 {
   "pluginNameA":  {"version": "X.Y.Z", "download": "URL where this plugin can be found"},
   ...,
   "pluginNameZ": {"version": "X.Y.Z", "download": "URL where this plugin can be found"}
 }
~~~

## Formatting
The help is formatted in md [Guide here](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet). But there are a few additional rules that are pretty common in MV helps.

~~~
==================
some title
==================
~~~
Will be replaced to an H2
~~~md
## some title
~~~

~~~
------------------
some title
------------------
~~~
Will be replaced to an H3
~~~md
### some title
~~~