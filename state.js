(function () {
  const DEFAULT_STATE = {
    content: {
      text: "Neon",
      fontFamily: "Abnoos",
      fontSize: 120,
      lineHeight: 1.2,
      textAlign: "center",
      direction: "rtl"
    },

    appearance: {
      template: "nx-t1",
      mainColor: "#00eaff",
      intensity: 1,
      isOff: false,

      // normalized shadow layers for renderer/export
      shadows: [],

      // optional metadata for layer semantics
      layerProfile: {
        darkLayerIndex: 3,
        glowStartIndex: 4
      }
    },

    animation: {
      activeEffect: "pulse",
      frame: 0,
      isPlaying: false,
      fps: 60,
      duration: 1000
    },

    scene: {
      width: 800,
      height: 400,
      bgUrl: "",
      useBg: false,
      isRendering: false,

      // runtime-resolved image object if loaded externally
      backgroundImage: null
    },

    runtime: {
      previewReady: false,
      exportReady: false,
      lastError: null,
      version: 1,
      dirty: false
    }
  };

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function cloneState(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function mergeSection(target, source) {
    const out = { ...target };

    Object.keys(source || {}).forEach((key) => {
      const srcVal = source[key];
      const tgtVal = out[key];

      if (isPlainObject(srcVal) && isPlainObject(tgtVal)) {
        out[key] = { ...tgtVal, ...srcVal };
      } else {
        out[key] = srcVal;
      }
    });

    return out;
  }

  const NeonState = {
    data: cloneState(DEFAULT_STATE),
    listeners: [],

    getState() {
      return this.data;
    },

    getSnapshot(overrides = {}) {
      const state = this.data;

      return {
        content: {
          text: state.content.text,
          fontFamily: state.content.fontFamily,
          fontSize: state.content.fontSize,
          lineHeight: state.content.lineHeight,
          textAlign: state.content.textAlign,
          direction: state.content.direction
        },

        appearance: {
          template: state.appearance.template,
          mainColor: state.appearance.mainColor,
          intensity: state.appearance.intensity,
          isOff: state.appearance.isOff,
          shadows: Array.isArray(state.appearance.shadows)
            ? [...state.appearance.shadows]
            : [],
          layerProfile: {
            ...(state.appearance.layerProfile || {})
          }
        },

        animation: {
          activeEffect: state.animation.activeEffect,
          frame: state.animation.frame,
          isPlaying: state.animation.isPlaying,
          fps: state.animation.fps,
          duration: state.animation.duration
        },

        scene: {
          width: state.scene.width,
          height: state.scene.height,
          bgUrl: state.scene.bgUrl,
          useBg: state.scene.useBg,
          isRendering: state.scene.isRendering,
          backgroundImage: state.scene.backgroundImage || null
        },

        runtime: {
          previewReady: state.runtime.previewReady,
          exportReady: state.runtime.exportReady,
          lastError: state.runtime.lastError,
          version: state.runtime.version,
          dirty: state.runtime.dirty
        },

        ...overrides
      };
    },

    subscribe(callback) {
      if (typeof callback !== "function") return () => {};
      this.listeners.push(callback);

      return () => {
        this.listeners = this.listeners.filter((fn) => fn !== callback);
      };
    },

    dispatch(type, payload = {}) {
      try {
        switch (type) {
          // content
          case "SET_TEXT":
            this.data.content = {
              ...this.data.content,
              text: payload.text ?? this.data.content.text
            };
            break;

          case "SET_FONT":
            this.data.content = {
              ...this.data.content,
              fontFamily: payload.fontFamily ?? this.data.content.fontFamily,
              fontSize: payload.fontSize ?? this.data.content.fontSize,
              lineHeight: payload.lineHeight ?? this.data.content.lineHeight,
              textAlign: payload.textAlign ?? this.data.content.textAlign,
              direction: payload.direction ?? this.data.content.direction
            };
            break;

          case "SET_TEXT_ALIGN":
            this.data.content = {
              ...this.data.content,
              textAlign: payload.textAlign ?? this.data.content.textAlign
            };
            break;

          case "SET_DIRECTION":
            this.data.content = {
              ...this.data.content,
              direction: payload.direction ?? this.data.content.direction
            };
            break;

          // appearance
          case "SET_TEMPLATE":
            this.data.appearance = {
              ...this.data.appearance,
              template: payload.template ?? this.data.appearance.template
            };
            break;

          case "SET_COLOR":
            this.data.appearance = {
              ...this.data.appearance,
              mainColor: payload.mainColor ?? this.data.appearance.mainColor
            };
            break;

          case "SET_INTENSITY":
            this.data.appearance = {
              ...this.data.appearance,
              intensity: payload.intensity ?? this.data.appearance.intensity
            };
            break;

          case "SET_POWER":
            this.data.appearance = {
              ...this.data.appearance,
              isOff: payload.isOff ?? this.data.appearance.isOff
            };
            break;

          case "SET_SHADOWS":
            this.data.appearance = {
              ...this.data.appearance,
              shadows: Array.isArray(payload.shadows) ? payload.shadows : []
            };
            break;

          case "SET_LAYER_PROFILE":
            this.data.appearance = {
              ...this.data.appearance,
              layerProfile: {
                ...(this.data.appearance.layerProfile || {}),
                ...(payload.layerProfile || {})
              }
            };
            break;

          // animation
          case "SET_EFFECT":
            this.data.animation = {
              ...this.data.animation,
              activeEffect: payload.activeEffect ?? this.data.animation.activeEffect
            };
            break;

          case "SET_FRAME":
            this.data.animation = {
              ...this.data.animation,
              frame: payload.frame ?? this.data.animation.frame
            };
            break;

          case "PLAY_ANIMATION":
            this.data.animation = {
              ...this.data.animation,
              isPlaying: true
            };
            break;

          case "STOP_ANIMATION":
            this.data.animation = {
              ...this.data.animation,
              isPlaying: false
            };
            break;

          case "SET_TIMING":
            this.data.animation = {
              ...this.data.animation,
              fps: payload.fps ?? this.data.animation.fps,
              duration: payload.duration ?? this.data.animation.duration
            };
            break;

          // scene
          case "SET_SCENE_SIZE":
            this.data.scene = {
              ...this.data.scene,
              width: payload.width ?? this.data.scene.width,
              height: payload.height ?? this.data.scene.height
            };
            break;

          case "SET_BACKGROUND":
            this.data.scene = {
              ...this.data.scene,
              bgUrl: payload.bgUrl ?? this.data.scene.bgUrl,
              useBg: payload.useBg ?? this.data.scene.useBg,
              backgroundImage:
                payload.backgroundImage !== undefined
                  ? payload.backgroundImage
                  : this.data.scene.backgroundImage
            };
            break;

          case "START_RENDER":
            this.data.scene = {
              ...this.data.scene,
              isRendering: true
            };
            break;

          case "FINISH_RENDER":
            this.data.scene = {
              ...this.data.scene,
              isRendering: false
            };
            break;

          // runtime
          case "SET_RUNTIME_FLAGS":
            this.data.runtime = {
              ...this.data.runtime,
              previewReady:
                payload.previewReady ?? this.data.runtime.previewReady,
              exportReady:
                payload.exportReady ?? this.data.runtime.exportReady,
              dirty: payload.dirty ?? this.data.runtime.dirty
            };
            break;

          case "SET_ERROR":
            this.data.runtime = {
              ...this.data.runtime,
              lastError: payload.lastError ?? null
            };
            break;

          case "CLEAR_ERROR":
            this.data.runtime = {
              ...this.data.runtime,
              lastError: null
            };
            break;

          case "RESET_STATE":
            this.data = cloneState(DEFAULT_STATE);
            break;

          default:
            console.warn("[NeonState] Unknown action:", type, payload);
            return;
        }

        this.data.runtime = {
          ...this.data.runtime,
          version: this.data.runtime.version + 1,
          dirty: true
        };

        this._notify(type, payload);
      } catch (error) {
        this.data.runtime = {
          ...this.data.runtime,
          lastError: error
        };
        this._notify("STATE_ERROR", { error, sourceAction: type, payload });
      }
    },

    set(path, value) {
      if (!path || typeof path !== "string") return;

      const parts = path.split(".");
      if (!parts.length) return;

      const root = parts[0];
      if (!this.data[root]) return;

      if (parts.length === 1) {
        this.data[root] = value;
      } else if (parts.length === 2) {
        this.data[root] = {
          ...this.data[root],
          [parts[1]]: value
        };
      } else {
        let ref = this.data[root];
        for (let i = 1; i < parts.length - 1; i++) {
          const key = parts[i];
          ref[key] = isPlainObject(ref[key]) ? { ...ref[key] } : {};
          ref = ref[key];
        }
        ref[parts[parts.length - 1]] = value;
      }

      this.data.runtime = {
        ...this.data.runtime,
        version: this.data.runtime.version + 1,
        dirty: true
      };

      this._notify("SET_PATH", { path, value });
    },

    updateBatch(updates = {}) {
      const next = { ...this.data };

      if (updates.content) {
        next.content = mergeSection(next.content, updates.content);
      }

      if (updates.appearance) {
        next.appearance = mergeSection(next.appearance, updates.appearance);
      }

      if (updates.animation) {
        next.animation = mergeSection(next.animation, updates.animation);
      }

      if (updates.scene) {
        next.scene = mergeSection(next.scene, updates.scene);
      }

      if (updates.runtime) {
        next.runtime = mergeSection(next.runtime, updates.runtime);
      }

      this.data = next;
      this.data.runtime = {
        ...this.data.runtime,
        version: this.data.runtime.version + 1,
        dirty: true
      };

      this._notify("BATCH_UPDATE", updates);
    },

    _notify(type = "UNKNOWN", payload = {}) {
      const snapshot = this.getSnapshot();

      this.listeners.forEach((callback) => {
        try {
          callback(snapshot, { type, payload });
        } catch (err) {
          console.error("[NeonState] Listener error:", err);
        }
      });
    }
  };

  window.NeonState = NeonState;
})();
