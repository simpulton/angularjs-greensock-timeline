var app = angular.module('website', ['ngAnimate', 'ui.bootstrap']);

app.controller('MainCtrl', function ($scope, $timeout, QueueService) {
    var INTERVAL = 10000,
        slides = [
            {id: "image00", src: "./images/image00.jpg", title: 'Our love', subtitle: 'will prove everyone wrong!'},
            {id: "image01", src: "./images/image01.jpg", title: 'Can you feel', subtitle: 'the love tonight!'},
            {id: "image02", src: "./images/image02.jpg", title: 'You', subtitle: 'complete me!'},
            {id: "image03", src: "./images/image03.jpg", title: 'Anything for you', subtitle: 'even accepting your family'},
            {id: "image04", src: "./images/image04.jpg", title: 'True love', subtitle: 'a dream within a dream'}
        ];

    function setCurrentSlideIndex(index) {
        $scope.currentIndex = index;
    }

    function isCurrentSlideIndex(index) {
        return $scope.currentIndex === index;
    }

    function nextSlide() {
        $scope.currentIndex = ($scope.currentIndex < $scope.slides.length - 1) ? ++$scope.currentIndex : 0;
        $timeout(nextSlide, INTERVAL);
    }

    function setCurrentAnimation(animation) {
        $scope.currentAnimation = animation;
    }

    function isCurrentAnimation(animation) {
        return $scope.currentAnimation === animation;
    }

    function loadSlides() {
        QueueService.loadManifest(slides);
    }

    $scope.$on('queueProgress', function (event, queueProgress) {
        $scope.$apply(function () {
            $scope.progress = queueProgress.progress * 100;
        });
    });

    $scope.$on('queueComplete', function (event, slides) {
        $scope.$apply(function () {
            $scope.slides = slides;
            $scope.loaded = true;

            $timeout(nextSlide, INTERVAL);
        });
    });

    $scope.progress = 0;
    $scope.loaded = false;
    $scope.currentIndex = 0;
    $scope.currentAnimation = 'slide-left-animation';

    $scope.setCurrentSlideIndex = setCurrentSlideIndex;
    $scope.isCurrentSlideIndex = isCurrentSlideIndex;
    $scope.setCurrentAnimation = setCurrentAnimation;
    $scope.isCurrentAnimation = isCurrentAnimation;

    loadSlides();
});

app.factory('QueueService', function ($rootScope) {
    var queue = new createjs.LoadQueue(true);

    function loadManifest(manifest) {
        queue.loadManifest(manifest);

        queue.on('progress', function (event) {
            $rootScope.$broadcast('queueProgress', event);
        });

        queue.on('complete', function () {
            $rootScope.$broadcast('queueComplete', manifest);
        });
    }

    return {
        loadManifest: loadManifest
    }
});

app.animation('.slide-animation', function ($window) {
    return {
        enter: function (element, done) {
            var startPoint = $window.innerWidth,
                tl = new TimelineLite();
            
            tl.fromTo(element.find('.bg'), 1, { left: startPoint}, {left: 0})
                .fromTo(element.find('.title'), 3, { left: startPoint, alpha: 0}, {left: 50, alpha: 1, ease: Ease.easeInOut})
                .fromTo(element.find('.subtitle'), 3, { left: startPoint, alpha: 0}, {left: 50, alpha: 1, ease: Ease.easeInOut, onComplete: done});

        },

        leave: function (element, done) {
            var endPoint = -$window.innerWidth,
                tl = new TimelineLite();

            tl.to(element, 1, {left: endPoint, onComplete: done});
        }
    };
});

app.directive('bgImage', function ($window) {
    return function (scope, element, attrs) {
        var resizeBG = function () {
            var bgwidth = element.width();
            var bgheight = element.height();

            var winwidth = $window.innerWidth;
            var winheight = $window.innerHeight;

            var widthratio = winwidth / bgwidth;
            var heightratio = winheight / bgheight;

            var widthdiff = heightratio * bgwidth;
            var heightdiff = widthratio * bgheight;

            if (heightdiff > winheight) {
                element.css({
                    width: winwidth + 'px',
                    height: heightdiff + 'px'
                });
            } else {
                element.css({
                    width: widthdiff + 'px',
                    height: winheight + 'px'
                });
            }
        };

        var windowElement = angular.element($window);
        windowElement.resize(resizeBG);

        element.bind('load', function () {
            resizeBG();
        });
    }
});

