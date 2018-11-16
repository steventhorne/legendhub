var app = angular.module( "legendwiki-app", ['ngCookies'] );

/* Gets a parameter by name from the url's query string
 *
 * @param {string} name - The name of the query parameter.
 */
getUrlParameter = function(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ?
        '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
