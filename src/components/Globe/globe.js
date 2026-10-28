"use client";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import countries from "./files/custom.geo.json";
import lines from "./files/lines.json";
import map from "./files/map.json";
import React, { useRef, useEffect, useState } from "react";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";

export default function InitiateGlobe() {
  const globeRef = useRef(null);
  const cameraRef = useRef(null);
  const GlobeRef = useRef(null);
  const elementRef = useRef(null);
  const container = useRef();
  const textRef = useRef();
  const arcLoop = useRef();
  let scene = useRef();

  let renderer,
    camera,
    controls,
    renderers = [],
    Globe;
  const [isVisible, setIsVisible] = useState(false);
  const [globeContentOpacity, setGlobeContentOpacity] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);
  const [animationMidPoint, setAnimationMidPoint] = useState(false);
  const [endAnimation, setEndAnimation] = useState(false);

  const calculateScrollFlags = (scrollTop, isMobile) => {
    const thresholds = isMobile
      ? { start: 4, mid: 130, end: 280, opacity: 50 }
      : { start: 6, mid: 300, end: 600, opacity: 300 };

    return {
      startAnimation: scrollTop > thresholds.start,
      animationMidPoint: scrollTop > thresholds.mid,
      endAnimation: scrollTop > thresholds.end,
      isVisible: scrollTop > 6,
      globeContentOpacity: scrollTop > thresholds.opacity ? 1 : 0,
    };
  };

  const handleScroll = () => {
    if (typeof window === "undefined" || !elementRef?.current) {
      return;
    }

    const scrollTop = window.scrollY;
    const isMobile = window.innerWidth <= 1024;

    const {
      startAnimation,
      animationMidPoint,
      endAnimation,
      isVisible,
      globeContentOpacity,
    } = calculateScrollFlags(scrollTop, isMobile);

    setStartAnimation(startAnimation);
    setAnimationMidPoint(animationMidPoint);
    setEndAnimation(endAnimation);
    setIsVisible(isVisible);
    setGlobeContentOpacity(globeContentOpacity);

    if (GlobeRef?.current) {
      GlobeRef.current.atmosphereColor(`#ffffff`);
    }
  };

  useEffect(() => {
    if (cameraRef?.current && typeof window !== "undefined") {
      // Camera positions adjusted for a larger globe
      if (
        startAnimation &&
        window?.innerWidth <= 1024 &&
        window?.innerWidth >= 800
      ) {
        cameraRef?.current?.position?.set(10, 10, 800);
      } else if (
        animationMidPoint &&
        window?.innerWidth <= 1024 &&
        window?.innerWidth >= 800
      ) {
        cameraRef?.current?.position?.set(10, 10, 800);
      } else if (startAnimation && window?.innerWidth <= 800) {
        cameraRef?.current?.position?.set(10, 10, 1000);
      } else if (animationMidPoint && window?.innerWidth <= 800) {
        cameraRef?.current?.position.set(10, 10, 1000);
      } else {
        cameraRef?.current?.position?.set(10, 100, 600);
      }
    }
  }, [startAnimation, window?.innerWidth, animationMidPoint]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [camera, isVisible, startAnimation]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setGlobeContentOpacity(0);
      if (elementRef?.current) {
        const rect = elementRef?.current?.getBoundingClientRect();
        const scrollTop = window?.scrollY;
        const isvisible =
          rect?.top - 500 < window?.innerHeight && scrollTop !== 0;
        setIsVisible(isvisible);
      }
      if (!globeRef?.current && typeof window !== "undefined") {
        arcLoop.current = createArcLoop();
        init();
        onWindowResize();
        scene?.current?.add(arcLoop?.current);
        globeRef.current = true;
      }
      window?.addEventListener("resize", onWindowResize, true);

      return () => {
        window?.removeEventListener("resize", onWindowResize);
        if (renderer) {
          renderer?.domElement.remove();
        }
        globeRef.current = false;
      };
    }
  }, []);

  function createArcLoop(radius = 120, thickness = 3) {
    const curve = new THREE.EllipseCurve(
      0,
      0,
      radius,
      radius,
      0,
      Math.PI,
      false,
      0
    );

    const points = curve.getPoints(100);
    const positions = [];
    points.forEach((point) => {
      positions.push(point.x, point.y, 0);
    });

    const geometry = new LineGeometry();
    geometry.setPositions(positions);

    const material = new LineMaterial({
      color: 0x0156fc,
      linewidth: thickness,
    });

    material.resolution.set(window.innerWidth, window.innerHeight);

    const ellipse = new Line2(geometry, material);
    ellipse.name = "ThickLine";
    ellipse.rotation.x = Math.PI / 2.5;
    return ellipse;
  }

  useEffect(() => {
    if (isVisible) {
      const refChildren = document?.getElementById("globe-wrapper")?.children;

      if (refChildren?.length) {
        Object.keys(refChildren)?.map((index) => {
          if (refChildren[index].tagName === "DIV") {
            refChildren[index].style.display = "block";
          }
          return null;
        });
      }

      const linesRenders = lines?.pulls?.map((line, indx) => {
        return {
          ...line,
          order: indx + 1,
          startLat: Number(line.startLat),
          startLng: Number(line.startLng),
          endLat: Number(line.endLat),
          endLng: Number(line.endLng),
        };
      });

      GlobeRef.current.arcsData(linesRenders);
      scene.current.add(arcLoop.current);
    } else {
      const refChildren = document?.getElementById("globe-wrapper")?.children;

      if (refChildren?.length !== 0) {
        Object.keys(refChildren)?.map((index) => {
          if (refChildren[index]?.tagName == "DIV") {
            refChildren[index].style.display = "none";
          }
          return null;
        });
      }
      GlobeRef?.current?.arcsData([]);
      scene?.current?.remove(arcLoop?.current);
    }
  }, [isVisible]);

  function init() {
    const linesRenders = lines?.pulls?.map((line, indx) => {
      return {
        ...line,
        order: indx + 1,
        startLat: Number(line.startLat),
        startLng: Number(line.startLng),
        endLat: Number(line.endLat),
        endLng: Number(line.endLng),
      };
    });

    Globe = new ThreeGlobe({
      waitForGlobeReady: true,
      animateIn: true,
    })
      .hexPolygonsData(countries.features)
      .hexPolygonResolution(5)
      .hexPolygonMargin(0.7)
      .showAtmosphere(true)
      .atmosphereColor("#ffffff")
      .atmosphereAltitude(0.1)
      .htmlElementsData(map.maps)
      .htmlElement((d) => {
        const el = document.createElement("div");
        el.className = `w-[30px] h-[30px] lg:w-[56px] lg:h-[37px]`;
        el.innerHTML = `<img style="width: 40px" src="${d.imgsrc}" />`;
        el.style["pointer-events"] = "none";


        return el;
      })
      .arcsData(linesRenders)
      .arcColor(() => "#0156fc")
      .arcStroke(0.6)
      .arcDashLength(0.6)
      .arcDashGap(4)
      .arcDashInitialGap((e) => e.order)
      .arcDashAnimateTime(1700);
    Globe.rotateY(-Math.PI * (5 / 9));
    Globe.rotateZ(-Math.PI / 6);
    const globeMaterial = Globe.globeMaterial();
    globeMaterial.color = new THREE.Color(0xffffff);
    globeMaterial.emissive = new THREE.Color(0xffffff);
    globeMaterial.emissiveIntensity = 0.7;
    globeMaterial.shininess = 0.5;
    globeMaterial.opacity = 0;

    Globe.hexPolygonsData(countries?.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .hexPolygonColor(() => "rgb(255 , 255 , 255)");

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearAlpha(0);
    renderer.setPixelRatio(window.devicePixelRatio);
    let GlobeWrapper = document.getElementById("globe-wrapper");
    renderer.shadowMap.enabled = true;

    renderers = [new CSS2DRenderer()];
    let parentId = document?.getElementById("globe-wrapper");
    renderers?.forEach((r, idx) => {
      r.domElement.style.position = "absolute";
      r.domElement.style.top = "0px";
      r.domElement.style.pointerEvents = "none";
      if (parentId?.children?.length < 2) {
        document?.getElementById("globe-wrapper").appendChild(r.domElement);
        document
          .getElementById("globe-wrapper")
          .appendChild(renderer.domElement);
      }
    });

    scene.current = new THREE.Scene();
    scene.current.background = new THREE.Color(0xfbfcfc);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.current.add(ambientLight);

    const dLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dLight.position.set(10, 50, 50);
    dLight.castShadow = true;
    dLight.shadow.mapSize.width = 1024;
    dLight.shadow.mapSize.height = 2048;
    dLight.shadow.camera.near = 0.03;
    dLight.shadow.camera.far = 10;
    scene.current.add(dLight);

    camera = new THREE.PerspectiveCamera(
      45,
      GlobeWrapper?.clientWidth / GlobeWrapper?.clientHeight,
      1,
      1000
    );

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.7;

    camera.aspect = GlobeWrapper?.clientWidth / GlobeWrapper?.clientHeight;
    camera?.updateProjectionMatrix();
    camera?.position.set(10, 0, 600); // Adjusted camera position
    cameraRef.current = camera;

    const checkData = (data) => {
      return (
        data &&
        Array.isArray(data) &&
        data.length > 0 &&
        typeof data[0] === "object"
      );
    };

    if (
      checkData(countries?.features) &&
      checkData(lines?.pulls) &&
      checkData(map?.maps)
    ) {
      GlobeRef.current = Globe;
      Globe?.setPointOfView(camera?.position, Globe?.position);

      controls?.addEventListener("change", () => {
        Globe?.setPointOfView(camera?.position, Globe?.position);
      });
      scene?.current?.add(Globe);
      animate();
    } else {
      console?.error("Data files are missing or incorrectly formatted.");
    }
  }

  function onWindowResize(bool = false) {
    let GlobeWrapper = document?.getElementById("globe-wrapper");
    const width = !bool ? window?.innerWidth : GlobeWrapper?.clientWidth;
    camera.aspect = width / window?.innerHeight;
    camera?.updateProjectionMatrix();

    renderer?.setSize(width, window?.innerHeight);
    renderers?.forEach((r) => r?.setSize(width, window?.innerHeight));
  }

  function animate() {
    requestAnimationFrame(animate);
    controls?.update();
    arcLoop.current.rotation.z += 0.01;
    renderers?.forEach((r) => r.render(scene?.current, camera));
    renderer?.render(scene?.current, camera);
  }
  let animationClass = "static";

  if (endAnimation) {
    animationClass = "absolute bottom-0 flex flex-col-reverse lg:block";
  } else if (startAnimation) {
    animationClass =
      "fixed left-0 right-0 m-auto flex flex-col-reverse lg:block";
  }

  let animationClass2 = "translate-y-[12.5%] scale-[0.75]";

  if (!startAnimation) {
    animationClass2 = "mt-[80vh] scale-[1] lg:scale-[2.5]";
  } else if (animationMidPoint) {
    animationClass2 =
      "lg:translate-x-[18.75vw] translate-y-[12.5%] scale-[0.75] -mt-[150px] lg:mt-[0]";
  }

  const baseClass =
    "lg:relative transform origin-top transition-all duration-500 justify-center items-center";
  return (
    <div
      className={`${
        endAnimation ? `h-[1000px]` : `h-[1000px]`
      } lg:h-[1500px] relative`}
    >
      <div
        className={`${animationClass}`}
        ref={container}
      >
        <div className="custom-container top-[-170px] z-[5] relative lg:static lg:mt-[0]">
          <div
            ref={textRef}
            className={`transition-opacity ease-in top-0 bottom-0 z-[-1] ${
              animationMidPoint
                ? "duration-500 lg:absolute z-[50] w-[100%] px-[20px] lg:w-max h-max lg:pl-[20px] lg:my-[35vh]"
                : "duration-500 invisible w-0  h-0 z-[-1]"
            }`}
            style={{
              opacity: globeContentOpacity,
              transition: "opacity 0.5s ease-in-out",
            }}
          >

          </div>
        </div>

        <div
          ref={elementRef}
          id="globe-wrapper"
          className={`${baseClass} ${animationClass2}`}
        ></div>
      </div>
    </div>
  );
}
