var getQueryString = function (field) {
  try {
    var href = window.top.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
  } catch (e) {
    return null;
  }
};

var runas = getQueryString('run_as');
var sdkPath = 'https://www.tonypan.sb.facebook.com/assets.php/en_US/fbadnw.js';
var pluginPath = 'https://www.tonypan.sb.facebook.com/audiencenetwork/web/?sdk=5.3';
if (runas === 'prod') {
  sdkPath = 'https://connect.facebook.net/en_US/fbadnw.js';
  pluginPath = 'https://www.facebook.com/audiencenetwork/web/?sdk=5.3';
} else if (runas) {
  sdkPath = 'https://www.' + runas + '.facebook.com/assets.php/en_US/fbadnw.js';
  pluginPath = 'https://www.' + runas + '.facebook.com/audiencenetwork/web/?sdk=5.3';
}

document.addEventListener("DOMContentLoaded", function() {
  if (getQueryString('txt')) {
    document.getElementById('text').style.display = 'block';
  }
});

window.onmessage = function (e) {
  if (e.data === 'mwebtest-creative-ready') {
    e.source.postMessage({
      name: 'mwebtest-settings',
      sdkPath: sdkPath,
      pluginPath: pluginPath,
      test: !!getQueryString('test'),
    }, '*');
  }
}