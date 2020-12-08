import * as Pioneer from 'pioneer-js';
import { Entity } from 'pioneer-scripts';

/** The time 60 seconds after cruise stage separation, used by the Mars 2020 team. */
const T0 = 666952142.000;

export class SetupSpacecraft {
	/**
	 * Sets up the spacecraft and all of the parts.
	 * @param {Pioneer.Scene} scene
	 */
	static setup(scene) {
		const mars = scene.get('mars');

		// Create Perseverance parent.
		const perseverance = Entity.createFromOptions('sc_perseverance', {
			radius: 0.00225,
			label: 'Mars 2020',
			trail: {
				length: 10000000.0
			},
			dynamo: [{
				url: 'assets/dynamo/sc_perseverance/mars/pos',
				parent: 'mars',
				customUrl: true
			}, {
				url: 'assets/dynamo/sc_perseverance/ori',
				customUrl: true
			}],
			postCreateFunction: (entity) => {
				// Make the trail relative to mars orientation.
				const trail = entity.get('trail');
				if (trail instanceof Pioneer.TrailComponent) {
					trail.setRelativeToParentOrientation(true);
					trail.resetPoints();
				}
				// Since dynamo starts after separation, fixed, spin, and keyframe backfills it.
				const fixedPre = entity.addController('fixed');
				if (fixedPre instanceof Pioneer.FixedController) {
					fixedPre.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 + 0.000));
					// UPDATE: Orientation of M20 at T0 + 0.000.
					fixedPre.setOrientation(new Pioneer.Quaternion(0.8109092986743931, -0.47341790357563024, 0.33425925681074165, -0.0810700137769209));
				}
				const spin = entity.addController('spin');
				if (spin instanceof Pioneer.SpinController) {
					spin.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 + 0.000));
					spin.setAxis(new Pioneer.Vector3(0, 0, 1), true);
					spin.setRate(2 * Math.PI / 30); // 30 rotations per hour.
					spin.setReferenceTime(T0);
					spin.setReferenceAngle(0.0);
				}
				const keyframePre = entity.addController('keyframe');
				keyframePre.setParent(mars);
				if (keyframePre instanceof Pioneer.KeyframeController) {
					keyframePre.addPositionKeyframe(T0 - 360.000, {
						// UPDATE: Position of M20 - 360 * velocity of M20 at T0 + 0.000.
						position: new Pioneer.Vector3(-497.7480251874273, -6038.5256971762865, -114.08757627726379)
					});
					keyframePre.addPositionKeyframe(T0 + 0.000, {
						// UPDATE: Position of M20 at T0 + 0.000.
						position: new Pioneer.Vector3(659.858717251302, -4745.123739328727, -483.8681486746802)
					});
				}
			}
		}, scene);

		// Cruise Stage
		Entity.createFromOptions('sc_perseverance_cruise_stage', {
			radius: 0.002,
			label: 'Cruise Stage',
			model: {
				url: 'assets/models/CruiseStage/edl2020_cruiseStage.gltf',
				rotate: [
					{ x: -90 }
				]
			},
			fixed: {
				// UPDATE: Orientation of M20 at T0 - 60.000.
				orientation: new Pioneer.Quaternion(0.810909298674393, -0.4734179035756301, 0.33425925681074165, -0.08107001377692065)
			},
			postCreateFunction: (entity) => {
				// It's fixed to M20 until the separation point.
				const fixed = entity.addController('fixed');
				if (fixed instanceof Pioneer.FixedController) {
					fixed.setPosition(Pioneer.Vector3.Zero);
					fixed.setOrientation(Pioneer.Quaternion.Identity);
					fixed.setParent(perseverance);
					fixed.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 - 60.000));
				}
				const rotateByParentOrientation = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientation instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientation.setRotatingOrientation(true);
					rotateByParentOrientation.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 - 60.000));
				}
				// Add a spin for when it separates.
				const spin = entity.addController('spin');
				if (spin instanceof Pioneer.SpinController) {
					spin.setAxis(new Pioneer.Vector3(0, 0, 1), true);
					spin.setRate(2 * Math.PI / 30); // 30 rotations per hour.
					spin.setReferenceTime(T0 - 60.000);
					spin.setReferenceAngle(0.0);
					spin.setCoverage(new Pioneer.Interval(T0 - 60.000, Number.POSITIVE_INFINITY));
				}
				const keyframe = entity.addController('keyframe');
				keyframe.setParent('sc_perseverance');
				if (keyframe instanceof Pioneer.KeyframeController) {
					keyframe.addPositionKeyframe(T0 - 60.000, { // Separation
						position: Pioneer.Vector3.Zero,
						relativeToEntityPosition: perseverance
					});
					keyframe.addPositionKeyframe(T0 - 50.000, { // Separate back.
						position: new Pioneer.Vector3(0, 0, -0.020),
						relativeToEntityPosition: perseverance,
						relativeToEntityOrientation: perseverance,
						relativeToEntityOrientationTime: T0 - 60.000
					});
					keyframe.addPositionKeyframe(T0 + 0.000, { // Separate back.
						position: new Pioneer.Vector3(0, 0, -0.240),
						relativeToEntityPosition: perseverance,
						relativeToEntityOrientation: perseverance,
						relativeToEntityOrientationTime: T0 - 60.000
					});
					keyframe.addPositionKeyframe(T0 + 120.000, { // Further back.
						position: new Pioneer.Vector3(0, 0, -1.000),
						relativeToEntityPosition: perseverance,
						relativeToEntityOrientation: perseverance,
						relativeToEntityOrientationTime: T0 - 60.000
					});
					keyframe.addPositionKeyframe(T0 + 300.000, { // Further back.
						position: new Pioneer.Vector3(0, 0, -2.440),
						relativeToEntityPosition: perseverance,
						relativeToEntityOrientation: perseverance,
						relativeToEntityOrientationTime: T0 - 60.000
					});
					keyframe.addPositionKeyframe(T0 + 633.000, { // And further back.
						position: new Pioneer.Vector3(0, 0, -28.00),
						relativeToEntityPosition: perseverance,
						relativeToEntityOrientation: perseverance,
						relativeToEntityOrientationTime: T0 - 60.000
					});
					keyframe.addPositionKeyframe(T0 + 740.000, { // Way back and disappear.
						position: new Pioneer.Vector3(0, 0, -70.386),
						relativeToEntityPosition: perseverance,
						relativeToEntityOrientation: perseverance,
						relativeToEntityOrientationTime: T0 - 60.000
					});
				}
			}
		}, scene);

		// Two ballasts.
		for (let i = 0; i < 2; i++) {
			Entity.createFromOptions('sc_perseverance_ballast_' + i, {
				radius: 0.0001,
				label: 'Balance Mass',
				fixed: {
					orientation: Pioneer.Quaternion.Identity
				},
				postCreateFunction: (entity) => {
					const keyframe = entity.addController('keyframe');
					keyframe.setParent('sc_perseverance');
					if (keyframe instanceof Pioneer.KeyframeController) {
						const factor = 2.0 * (i - 0.5);
						keyframe.addPositionKeyframe(T0 + 57.020, { // Balance mass ejection
							position: new Pioneer.Vector3(0.002, factor * 0.0002, 0.00065),
							relativeToEntityPosition: perseverance,
							relativeToEntityOrientation: perseverance
						});
						keyframe.addPositionKeyframe(T0 + 570.145, { // End point
							position: new Pioneer.Vector3(1, factor * 0.020, 0.00065),
							relativeToEntityPosition: perseverance,
							relativeToEntityPositionTime: T0 + 57.020,
							relativeToEntityOrientation: perseverance,
							relativeToEntityOrientationTime: T0 + 57.020
						});
					}
				}
			}, scene);
		}

		// Backshell
		Entity.createFromOptions('sc_perseverance_backshell', {
			radius: 0.00225,
			label: 'Backshell',
			model: {
				url: 'assets/models/Backshell/edl2020_backshell.gltf',
				rotate: [
					{ x: -90 }
				]
			},
			trail: {
				length: 1000.0
			},
			dynamo: [{
				url: 'assets/dynamo/sc_perseverance_backshell/ori',
				customUrl: true
			}],
			postCreateFunction: (entity) => {
				// Make the trail relative to mars orientation.
				const trail = entity.get('trail');
				if (trail instanceof Pioneer.TrailComponent) {
					trail.setStartTime(T0 + 888.910);
					trail.setEndTime(T0 + 888.910 + 60);
					trail.setRelativeTime(false);
					trail.setRelativeToParentOrientation(true);
					trail.resetPoints();
				}
				// It's fixed to M20 until the separation point.
				const fixedAttached = entity.addController('fixed');
				if (fixedAttached instanceof Pioneer.FixedController) {
					fixedAttached.setPosition(Pioneer.Vector3.Zero);
					fixedAttached.setOrientation(Pioneer.Quaternion.Identity);
					fixedAttached.setParent(perseverance);
					fixedAttached.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 + 888.910));
				}
				const rotateByParentOrientationAttached = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientationAttached instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientationAttached.setRotatingOrientation(true);
					rotateByParentOrientationAttached.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 + 888.910));
				}
				// The separation keyframes.
				const keyframe = entity.addController('keyframe');
				keyframe.setParent(mars);
				if (keyframe instanceof Pioneer.KeyframeController) {
					keyframe.addPositionKeyframe(T0 + 888.910, { // Separation
						// UPDATE: M20 position in mars frame at T0 + 888.910.
						position: new Pioneer.Vector3(700.8429965793329, 3142.199789119053, 1074.9541744854735)
					});
					keyframe.addPositionKeyframe(T0 + 888.910 + 53.432, { // Fly away further.
						position: new Pioneer.Vector3(700.9784361453491, 3140.3309044053594, 1073.4985109483948)
					});
				}
				// It's fixed on ground after this point.
				const fixedGround = entity.addController('fixed');
				if (fixedGround instanceof Pioneer.FixedController) {
					fixedGround.setPosition(new Pioneer.Vector3(700.9784361453491, 3140.3309044053594, 1073.4985109483948));
					// UPDATE: Backshell orientation at T0 + 888.910 + 53.432.
					fixedGround.setOrientation(new Pioneer.Quaternion(0.7937387940233991, -0.4012801395784579, -0.45623782291500575, 0.02828471997296891));
					fixedGround.setParent(mars);
					fixedGround.setCoverage(new Pioneer.Interval(T0 + 888.910 + 53.432, Number.POSITIVE_INFINITY));
				}
				// Its position needs to be relative to mars so that it flies appropriately.
				const rotateByParentOrientationSeparated = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientationSeparated instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientationSeparated.setRotatingOrientation(false);
					rotateByParentOrientationSeparated.setCoverage(new Pioneer.Interval(T0 + 888.910, Number.POSITIVE_INFINITY));
				}
			}
		}, scene);

		// Parachute Cap
		Entity.createFromOptions('sc_perseverance_chutecap', {
			radius: 0.0001,
			model: {
				url: 'assets/models/ChuteCap/edl2020_chuteCap.gltf',
				rotate: [
					{ x: -90 }
				]
			},
			postCreateFunction: (entity) => {
				// It's fixed to M20 until the separation point.
				const fixed = entity.addController('fixed');
				if (fixed instanceof Pioneer.FixedController) {
					fixed.setPosition(Pioneer.Vector3.Zero);
					fixed.setOrientation(Pioneer.Quaternion.Identity);
					fixed.setParent(perseverance);
					fixed.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 + 783.275 - 2.000));
				}
				const rotateByParentOrientation = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientation instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientation.setRotatingOrientation(true);
					rotateByParentOrientation.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 + 783.275 - 2.000));
				}
			}
		}, scene);

		// Parachute
		Entity.createFromOptions('sc_perseverance_parachute', {
			radius: 0.002,
			label: 'Parachute',
			model: {
				url: 'assets/models/Chute/edl2020_chute.gltf',
				rotate: [
					{ x: -90 }
				]
			},
			postCreateFunction: (entity) => {
				// It's fixed to the backshell.
				const fixed = entity.addController('fixed');
				if (fixed instanceof Pioneer.FixedController) {
					fixed.setPosition(Pioneer.Vector3.Zero);
					fixed.setOrientation(Pioneer.Quaternion.Identity);
					fixed.setParent(scene.get('sc_perseverance_backshell'));
					fixed.setCoverage(new Pioneer.Interval(T0 + 783.275, Number.POSITIVE_INFINITY));
				}
				const rotateByParentOrientation = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientation instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientation.setRotatingOrientation(true);
					rotateByParentOrientation.setCoverage(new Pioneer.Interval(T0 + 783.275, Number.POSITIVE_INFINITY));
				}
			}
		}, scene);

		// Heat shield
		Entity.createFromOptions('sc_perseverance_heat_shield', {
			radius: 0.00225,
			label: 'Heat Shield',
			trail: {
				length: 100
			},
			model: {
				url: 'assets/models/HeatShield/edl2020_heatshield.gltf',
				rotate: [
					{ x: -90 }
				]
			},
			coverages: [{ // Adding the entry burn model.
				coverage: [T0, T0 + 783.275],
				update: (entity) => {
					const entryBurnModel = entity.getComponent('entryBurn');
					if (entryBurnModel instanceof Pioneer.ModelComponent) {
						// Get the speed, subtracting off the approximate speed of the ground below.
						const speed = Math.max(0, perseverance.getVelocity().magnitude() - (0.951 * 3396 * mars.getAngularVelocity().magnitude()));
						const atmosphereDensity = 1100.0 * Math.exp(-(perseverance.getPosition().magnitude() - 3396.0) / 11.0);
						const material = entryBurnModel.getMaterial('effects.003');
						if (material instanceof Pioneer.THREE.ShaderMaterial) {
							// Calculation to turn black-body temperature into RGBA values.
							const temperature = speed * speed * atmosphereDensity;
							const r = Pioneer.MathUtils.clamp(164.32 + 753.6 * Math.exp(temperature / -3060), 0, 255);
							const g = Pioneer.MathUtils.clamp(262.77 - 335.83 * Math.exp(temperature / -2216), 0, 186.85 + 346 * Math.exp(temperature / -3746));
							const b = Pioneer.MathUtils.clamp(426.9 - 563.76 * Math.exp(temperature / -5479), temperature / 157.142 + 24.272, 255);
							const a = Pioneer.MathUtils.clamp(255 * Math.log((temperature - 250) / 500 + 1), 0, 255);
							material.uniforms.colorMultiplier.value.set(r / 255, g / 255, b / 255, 10 * a / 255);
						}
					}
				},
				exit: (entity) => {
					const entryBurnModel = entity.getComponent('entryBurn');
					if (entryBurnModel instanceof Pioneer.ModelComponent) {
						const material = entryBurnModel.getMaterial('effects.003');
						if (material !== null) {
							material.uniforms.colorMultiplier.value.set(1, 1, 1, 0);
						}
					}
				}
			}, { // Offset of the heat shield so it rotates around a better axis.
				coverage: [T0 + 804.269, Number.POSITIVE_INFINITY],
				exit: (entity) => {
					const model = entity.getComponentByType('model');
					if (model instanceof Pioneer.ModelComponent) {
						if (model.getRoot() !== null) {
							model.getRoot().children[0].children[0].position.set(0, 0, 0);
						}
					}
				},
				update: (entity) => {
					const model = entity.getComponentByType('model');
					if (model instanceof Pioneer.ModelComponent) {
						if (model.getRoot() !== null) {
							const lerpOffset = Pioneer.MathUtils.clamp01((entity.getScene().getEngine().getTime() - (T0 + 804.269)) / 1.0);
							// UPDATE: If heat shield mesh offset changes, update it here.
							model.getRoot().children[0].children[0].position.set(0, 1.20 * lerpOffset, 0);
						}
					}
				}
			}, { // Changing the texture to burnth when it enters the atmosphere.
				coverage: [T0 + 610.000, Number.POSITIVE_INFINITY],
				enter: (entity) => {
					const model = entity.get('model', 0);
					if (model instanceof Pioneer.ModelComponent) {
						const material = model.getMaterial('heat_shield_AO');
						if (material instanceof Pioneer.THREE.ShaderMaterial) {
							console.log('in');
							entity.getScene().getEngine().getTextureLoader().loadIntoUniform(material.uniforms.colorTexture, '$STATIC_ASSETS_URL/models/sc_perseverance/edl/HeatShield/heat_shield_AO_burnt.png', false, true);
						}
					}
				},
				exit: (entity) => {
					const model = entity.get('model', 0);
					if (model instanceof Pioneer.ModelComponent) {
						const material = model.getMaterial('heat_shield_AO');
						if (material instanceof Pioneer.THREE.ShaderMaterial) {
							console.log('out');
							entity.getScene().getEngine().getTextureLoader().loadIntoUniform(material.uniforms.colorTexture, '$STATIC_ASSETS_URL/models/sc_perseverance/edl/HeatShield/heat_shield_AO.png', false, true);
						}
					}
				}
			}],
			postCreateFunction: (entity) => {
				// Make the tail relative to mars orientation.
				const trail = entity.get('trail');
				if (trail instanceof Pioneer.TrailComponent) {
					trail.setRelativeToParentOrientation(true);
					trail.resetPoints();
				}
				// Setup texture change for main model.
				const model = entity.get('model', 0);
				if (model instanceof Pioneer.ModelComponent) {
					model.setMeshCreatedCallback(() => {
						const material = model.getMaterial('heat_shield_AO');
						if (material instanceof Pioneer.THREE.ShaderMaterial) {
							const burnt = (entity.getScene().getEngine().getTime() >= T0 + 610.000) ? '_burnt' : '';
							entity.getScene().getEngine().getTextureLoader().loadIntoUniform(material.uniforms.colorTexture, '$STATIC_ASSETS_URL/models/sc_perseverance/edl/HeatShield/heat_shield_AO' + burnt + '.png', false, true);
						}
					});
				}
				// Add entry burn model.
				const entryBurnModel = entity.addComponent('model', 'entryBurn');
				if (entryBurnModel instanceof Pioneer.ModelComponent) {
					entryBurnModel.setUrl('assets/models/Entry_Burn/edl2020_entryBurn.gltf');
					entryBurnModel.setRotation(entity.get('model', 0).getRotation());
					entryBurnModel.setMeshCreatedCallback(async () => {
						const oldMaterial = entryBurnModel.getMaterial('effects.003');
						const newMaterial = await entity.getScene().getEngine().getMaterialManager().get('plumes');
						newMaterial.uniforms.colorTexture.value = oldMaterial.uniforms.colorTexture.value;
						newMaterial.uniforms.colorTexture.value.wrapS = Pioneer.THREE.RepeatWrapping;
						newMaterial.uniforms.colorTexture.value.wrapT = Pioneer.THREE.RepeatWrapping;
						newMaterial.uniforms.colorMultiplier.value = new Pioneer.THREE.Vector4(1, 1, 1, 0);
						newMaterial.uniforms.speed.value = 0.0;
						entryBurnModel.updateMaterial('effects.003', newMaterial);
					});
				}
				// It's fixed to M20 until the separation point.
				const fixed = entity.addController('fixed');
				if (fixed instanceof Pioneer.FixedController) {
					fixed.setPosition(Pioneer.Vector3.Zero);
					fixed.setOrientation(Pioneer.Quaternion.Identity);
					fixed.setParent(perseverance);
					fixed.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 + 804.269));
				}
				const rotateByParentOrientation = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientation instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientation.setRotatingPosition(false);
					rotateByParentOrientation.setRotatingOrientation(true);
					rotateByParentOrientation.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 + 804.269));
				}
				// Add keyframes for separation.
				const keyframe = entity.addController('keyframe');
				keyframe.setParent('mars');
				if (keyframe instanceof Pioneer.KeyframeController) {
					keyframe.addPositionKeyframe(T0 + 804.269, { // Separation
						// UPDATE: M20 position in mars frame at T0 + 804.269.
						position: new Pioneer.Vector3(705.593064376437, 3148.113142221692, 1078.3818888641947)
					});
					keyframe.addPositionKeyframe(T0 + 804.269 + 15, { // Fly away somewhere.
						position: new Pioneer.Vector3(702.4418208779947, 3145.9844968597126, 1076.5851208833976)
					});
					keyframe.addPositionKeyframe(T0 + 804.269 + 50, { // Fly away further.
						position: new Pioneer.Vector3(699.9106704567893, 3140.6106400058807, 1073.3847759177113)
					});
				}
				// It's fixed on ground after this point.
				const fixedGround = entity.addController('fixed');
				if (fixedGround instanceof Pioneer.FixedController) {
					fixedGround.setParent(mars);
					fixedGround.setPosition(new Pioneer.Vector3(699.9106704567893, 3140.6106400058807, 1073.3847759177113));
					fixedGround.setCoverage(new Pioneer.Interval(T0 + 804.269 + 50, Number.POSITIVE_INFINITY));
				}
				// Its position needs to be relative to mars so that it flies appropriately.
				const rotateByParentOrientationSeparated = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientationSeparated instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientationSeparated.setRotatingOrientation(false);
					rotateByParentOrientationSeparated.setCoverage(new Pioneer.Interval(T0 + 804.269, Number.POSITIVE_INFINITY));
				}
				// It starts oriented with M20 and then spins away from there.
				const fixedSeparated = entity.addController('fixed');
				if (fixedSeparated instanceof Pioneer.FixedController) {
					// UPDATE: M20 Orientation at T0 + 804.269
					fixedSeparated.setOrientation(new Pioneer.Quaternion(0.24029421201414608, -0.13317488633267183, -0.6340011491170063, -0.7228870480518348));
					fixedSeparated.setCoverage(new Pioneer.Interval(T0 + 804.269, Number.POSITIVE_INFINITY));
				}
				const spin = entity.addController('spin');
				if (spin instanceof Pioneer.SpinController) {
					spin.setAxis(new Pioneer.Vector3(0, 1, 0), true);
					spin.setRate(0.1);
					spin.setReferenceTime(T0 + 804.269);
					spin.setReferenceAngle(0.0);
					spin.setCoverage(new Pioneer.Interval(T0 + 804.269, T0 + 804.269 + 60.0));
				}
			}
		}, scene);

		// Rover
		Entity.createFromOptions('sc_perseverance_rover', {
			radius: 0.002,
			label: 'Perseverance',
			model: {
				url: '$STATIC_ASSETS_URL/models/sc_perseverance/edl/Perse/edl2020_perse.gltf',
				rotate: [
					{ x: -90 }
				]
			},
			dynamo: [{
				url: 'assets/dynamo/sc_perseverance_rover/mars/pos',
				parent: 'mars',
				customUrl: true
			}, {
				url: 'assets/dynamo/sc_perseverance_rover/ori',
				customUrl: true
			}],
			postCreateFunction: (entity) => {
				entity.addComponent('gizmo');
				// It's fixed to M20.
				const fixed = entity.addController('fixed');
				if (fixed instanceof Pioneer.FixedController) {
					fixed.setPosition(Pioneer.Vector3.Zero);
					fixed.setOrientation(Pioneer.Quaternion.Identity);
					fixed.setParent('sc_perseverance');
					fixed.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 + 933.532));
				}
				const rotateByParentOrientation = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientation instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientation.setRotatingOrientation(true);
					rotateByParentOrientation.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 + 933.532));
				}
				// It's fixed on ground after this point.
				const fixedGround = entity.addController('fixed');
				if (fixedGround instanceof Pioneer.FixedController) {
					fixedGround.setParent(mars);
					// UPDATE: M20 position in mars frame at T0 + 949.610.
					fixedGround.setPosition(new Pioneer.Vector3(700.7172357536766, 3140.286921221415, 1073.747552904285));
					fixedGround.setCoverage(new Pioneer.Interval(T0 + 949.610, Number.POSITIVE_INFINITY));
				}
				// Its position needs to be relative to mars so that it flies appropriately.
				const rotateByParentOrientationSeparated = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientationSeparated instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientationSeparated.setRotatingOrientation(false);
					rotateByParentOrientationSeparated.setCoverage(new Pioneer.Interval(T0 + 949.610, Number.POSITIVE_INFINITY));
				}
				// Add the model animations.
				const modelAnimate = entity.addController('modelAnimate');
				if (modelAnimate instanceof Pioneer.ModelAnimateController) {
					modelAnimate.setAnimation(entity.get('model'), 'susp_arm_f_l', 'susp_arm_f_lAction.002', new Pioneer.Interval(T0 + 934.532, T0 + 934.532 + 4.000));
					modelAnimate.setAnimation(entity.get('model'), 'susp_arm_f_r', 'susp_arm_f_rAction.002', new Pioneer.Interval(T0 + 934.532, T0 + 934.532 + 4.000));
					modelAnimate.setAnimation(entity.get('model'), 'susp_arm_m_l', 'susp_arm_m_lAction.002', new Pioneer.Interval(T0 + 934.532, T0 + 934.532 + 4.000));
					modelAnimate.setAnimation(entity.get('model'), 'susp_arm_m_r', 'susp_arm_m_rAction.002', new Pioneer.Interval(T0 + 934.532, T0 + 934.532 + 4.000));
					modelAnimate.setAnimation(entity.get('model'), 'susp_arm_b_l', 'susp_arm_b_lAction.001', new Pioneer.Interval(T0 + 934.532, T0 + 934.532 + 4.000));
					modelAnimate.setAnimation(entity.get('model'), 'susp_arm_b_r', 'susp_arm_b_rAction.001', new Pioneer.Interval(T0 + 934.532, T0 + 934.532 + 4.000));
					modelAnimate.setAnimation(entity.get('model'), 'susp_steer_f_l', 'susp_steer_f_lAction.001', new Pioneer.Interval(T0 + 934.532, T0 + 934.532 + 4.000));
					modelAnimate.setAnimation(entity.get('model'), 'susp_steer_f_r', 'susp_steer_f_rAction.001', new Pioneer.Interval(T0 + 934.532, T0 + 934.532 + 4.000));
				}
				// Add coverage for the offsets of the rover mesh so that it lines up with the IGP point.
				const coverage = entity.addController('coverage');
				if (coverage instanceof Pioneer.CoverageController) {
					coverage.addCoverage(new Pioneer.Interval(T0 + 933.532, Number.POSITIVE_INFINITY), undefined,
						(entity) => { // exit
							const model = entity.getComponentByType('model');
							if (model instanceof Pioneer.ModelComponent) {
								if (model.getRoot() !== null) {
									model.getRoot().children[0].position.set(0, 0, 0);
								}
							}
						}, (entity) => { // update
							const model = entity.getComponentByType('model');
							if (model instanceof Pioneer.ModelComponent) {
								if (model.getRoot() !== null) {
									// The difference between the IGP, which spice uses and the model origin.
									model.getRoot().children[0].position.set(0, 0.9637721523176879, 0);
								}
							}
						});
				}
			}
		}, scene);

		// Descent Stage
		Entity.createFromOptions('sc_perseverance_descent_stage', {
			radius: 0.002,
			label: 'Descent Stage',
			model: {
				url: 'assets/models/SkyCrane/edl2020_skyCrane.gltf',
				rotate: [
					{ x: -90 }
				]
			},
			trail: {
				length: 100
			},
			coverages: [{
				// Turn on the thrusters and plumes right after the backshell separates.
				coverage: [T0 + 888.910 + 0.5, T0 + 957.012],
				enter: (entity) => {
					entity.get('model', 1).setEnabled(true);
					entity.get('model', 2).setEnabled(true);
				},
				exit: (entity) => {
					entity.get('model', 1).setEnabled(false);
					entity.get('model', 2).setEnabled(false);
				}
			}, {
				// Turn off the 4 straight-down thrusters right before the rover separation.
				coverage: [T0 + 933.532 - 1.5, T0 + 957.012],
				update: (entity) => {
					const thrusterModel = entity.get('model', 1);
					if (thrusterModel instanceof Pioneer.ModelComponent && thrusterModel.getRoot() !== null) {
						const threeJsObjects = thrusterModel.getRoot().children[0].children;
						threeJsObjects[0].visible = false;
						threeJsObjects[2].visible = false;
						threeJsObjects[5].visible = false;
						threeJsObjects[6].visible = false;
					}
					const plumesModel = entity.get('model', 2);
					if (plumesModel instanceof Pioneer.ModelComponent && plumesModel.getRoot() !== null) {
						const threeJsObjects = plumesModel.getRoot().children[0].children;
						threeJsObjects[1].visible = false;
						threeJsObjects[2].visible = false;
						threeJsObjects[4].visible = false;
						threeJsObjects[6].visible = false;
					}
				},
				exit: (entity) => {
					const thrusterModel = entity.get('model', 1);
					if (thrusterModel instanceof Pioneer.ModelComponent && thrusterModel.getRoot() !== null) {
						const threeJsObjects = thrusterModel.getRoot().children[0].children;
						threeJsObjects[0].visible = true;
						threeJsObjects[2].visible = true;
						threeJsObjects[5].visible = true;
						threeJsObjects[6].visible = true;
					}
					const plumesModel = entity.get('model', 2);
					if (plumesModel instanceof Pioneer.ModelComponent && plumesModel.getRoot() !== null) {
						const threeJsObjects = plumesModel.getRoot().children[0].children;
						threeJsObjects[1].visible = true;
						threeJsObjects[2].visible = true;
						threeJsObjects[4].visible = true;
						threeJsObjects[6].visible = true;
					}
				}
			}],
			postCreateFunction: async (entity) => {
				// Make the tail relative to mars orientation.
				const trail = entity.get('trail');
				if (trail instanceof Pioneer.TrailComponent) {
					trail.setRelativeToParentOrientation(true);
					trail.resetPoints();
				}
				// Add thruster and plume models.
				const thrustersModel = entity.addComponent('model');
				if (thrustersModel instanceof Pioneer.ModelComponent) {
					thrustersModel.setUrl('assets/models/SkyCrane_Thrusters/edl2020_skyCraneThrusters.gltf');
					thrustersModel.setRotation(entity.get('model', 0).getRotation());
					thrustersModel.setMeshCreatedCallback(async () => {
						const oldMaterial = thrustersModel.getMaterial('effects');
						const newMaterial = await entity.getScene().getEngine().getMaterialManager().get('plumes');
						newMaterial.uniforms.colorTexture.value = oldMaterial.uniforms.colorTexture.value;
						newMaterial.uniforms.colorTexture.value.wrapS = Pioneer.THREE.RepeatWrapping;
						newMaterial.uniforms.colorTexture.value.wrapT = Pioneer.THREE.RepeatWrapping;
						newMaterial.uniforms.colorMultiplier.value = new Pioneer.THREE.Vector4(1, 1, 1, 1);
						newMaterial.uniforms.speed.value = 0.0;
						thrustersModel.updateMaterial('effects', newMaterial);
						// Turn the model on/off if it is in the proper coverage.
						const coverageController = entity.get('coverage');
						if (coverageController instanceof Pioneer.CoverageController) {
							const on = coverageController.coverageContains(0, entity.getScene().getEngine().getTime());
							thrustersModel.setEnabled(on);
						}
					});
				}
				const plumesModel = entity.addComponent('model');
				if (plumesModel instanceof Pioneer.ModelComponent) {
					plumesModel.setUrl('assets/models/SkyCrane_Plumes/edl2020_skyCranePlumes.gltf');
					plumesModel.setRotation(entity.get('model', 0).getRotation());
					plumesModel.setMeshCreatedCallback(async () => {
						const oldMaterial = plumesModel.getMaterial('Plumes2');
						const newMaterial = await entity.getScene().getEngine().getMaterialManager().get('plumes');
						newMaterial.uniforms.colorTexture.value = oldMaterial.uniforms.colorTexture.value;
						newMaterial.uniforms.colorTexture.value.wrapS = Pioneer.THREE.RepeatWrapping;
						newMaterial.uniforms.colorTexture.value.wrapT = Pioneer.THREE.RepeatWrapping;
						newMaterial.uniforms.colorMultiplier.value = new Pioneer.THREE.Vector4(1, 1, 1, 0.25);
						newMaterial.uniforms.speed.value = -0.5;
						plumesModel.updateMaterial('Plumes2', newMaterial);
						// Turn the model on/off if it is in the proper coverage.
						const coverageController = entity.get('coverage');
						if (coverageController instanceof Pioneer.CoverageController) {
							const on = coverageController.coverageContains(0, entity.getScene().getEngine().getTime());
							plumesModel.setEnabled(on);
						}
					});
				}
				// Add the cable models.
				const cable = entity.addComponent('connectedSprite');
				if (cable instanceof Pioneer.ConnectedSpriteComponent) {
					cable.setTextureUrl('$STATIC_ASSETS_URL/models/sc_perseverance/edl/Cables/cable.png');
					cable.setEntity1(entity);
					cable.setEntity1Offset(new Pioneer.Vector3(0.00049103, -0.000082696, 0.00040494));
					cable.setEntity2(scene.getEntity('sc_perseverance_rover'));
					cable.setEntity2Offset(new Pioneer.Vector3(0.000635, 0, -0.00030));
					cable.setWidth('0.0001');
					cable.setTextureRepeat(false);
				}
				const rope1 = entity.addComponent('connectedSprite');
				if (rope1 instanceof Pioneer.ConnectedSpriteComponent) {
					rope1.setTextureUrl('$STATIC_ASSETS_URL/models/sc_perseverance/edl/Cables/rope.png');
					rope1.setEntity1(entity);
					rope1.setEntity1Offset(new Pioneer.Vector3(0.000006286, 0.000001785, 0.00014488));
					rope1.setEntity2(scene.getEntity('sc_perseverance_rover'));
					rope1.setEntity2Offset(new Pioneer.Vector3(0.00044, 0, -0.00047));
					rope1.setWidth('0.0001');
					rope1.setTextureRepeat(false);
				}
				const rope2 = entity.addComponent('connectedSprite');
				if (rope2 instanceof Pioneer.ConnectedSpriteComponent) {
					rope2.setTextureUrl('$STATIC_ASSETS_URL/models/sc_perseverance/edl/Cables/rope.png');
					rope2.setEntity1(entity);
					rope2.setEntity1Offset(new Pioneer.Vector3(0.000006286, 0.000001785, 0.00014488));
					rope2.setEntity2(scene.getEntity('sc_perseverance_rover'));
					rope2.setEntity2Offset(new Pioneer.Vector3(-0.00022, 0.00038, -0.00047));
					rope2.setWidth('0.0001');
					rope2.setTextureRepeat(false);
				}
				const rope3 = entity.addComponent('connectedSprite');
				if (rope3 instanceof Pioneer.ConnectedSpriteComponent) {
					rope3.setTextureUrl('$STATIC_ASSETS_URL/models/sc_perseverance/edl/Cables/rope.png');
					rope3.setEntity1(entity);
					rope3.setEntity1Offset(new Pioneer.Vector3(0.000006286, 0.000001785, 0.00014488));
					rope3.setEntity2(scene.getEntity('sc_perseverance_rover'));
					rope3.setEntity2Offset(new Pioneer.Vector3(-0.00022, -0.00038, -0.00047));
					rope3.setWidth('0.0001');
					rope3.setTextureRepeat(false);
				}
				// It's fixed to M20 until separation (at which point the dynamo has run out).
				const fixed = entity.addController('fixed');
				if (fixed instanceof Pioneer.FixedController) {
					fixed.setPosition(Pioneer.Vector3.Zero);
					fixed.setOrientation(Pioneer.Quaternion.Identity);
					fixed.setParent('sc_perseverance');
					fixed.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 + 950.222));
				}
				const rotateByParentOrientation = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientation instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientation.setRotatingOrientation(true);
					rotateByParentOrientation.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 + 950.222));
				}
				// The dynamo doesn't include the descent stage fly away, so adding it here.
				const keyframePost = entity.addController('keyframe');
				keyframePost.setParent(mars);
				if (keyframePost instanceof Pioneer.KeyframeController) {
					keyframePost.addPositionKeyframe(T0 + 950.222, {
						// UPDATE: Position of M20 at T0 + 950.222.
						position: new Pioneer.Vector3(700.7188360421875, 3140.293788794516, 1073.750230330617)
					});
					keyframePost.addPositionKeyframe(T0 + 950.222 + 6.000, {
						position: new Pioneer.Vector3(700.7533866164556, 3140.419027437696, 1073.5569438483712)
					});
					keyframePost.addPositionKeyframe(T0 + 950.222 + 10.000, {
						position: new Pioneer.Vector3(700.7794480663632, 3140.5139389992178, 1073.3446634656586)
					});
					keyframePost.addPositionKeyframe(T0 + 950.222 + 16.000, {
						position: new Pioneer.Vector3(700.8165882212365, 3140.4802902374727, 1073.143339339353)
					});
					keyframePost.addOrientationKeyframe(T0 + 950.222, {
						// UPDATE: Position of M20 at T0 + 950.222.
						orientation: new Pioneer.Quaternion(0.742609656174994, -0.12345220647494637, -0.5730508861374051, -0.3238875316668726)
					});
					keyframePost.addOrientationKeyframe(T0 + 950.222 + 2.0, {
						// UPDATE: Position of M20 at T0 + 950.222.
						orientation: new Pioneer.Quaternion(0.9053789420122392, 0.009891425512975227, -0.24524557265729852, -0.3464761754495011)
					});
					keyframePost.addOrientationKeyframe(T0 + 950.222 + 16.0, {
						// UPDATE: Position of M20 at T0 + 950.222.
						orientation: new Pioneer.Quaternion(0.9053789420122392, -0.2380013591240958, -0.24524557265729852, -0.2519899472357486)
					});
				}
				// Make it fixed to ground.
				const fixedPost = entity.addController('fixed');
				if (fixedPost instanceof Pioneer.FixedController) {
					fixedPost.setCoverage(new Pioneer.Interval(T0 + 950.222 + 16.000, Number.POSITIVE_INFINITY));
					// UPDATE: Position of last keyframe.
					fixedPost.setPosition(new Pioneer.Vector3(700.8165882212365, 3140.4802902374727, 1073.143339339353));
				}
				// Its position needs to be relative to mars so that it flies appropriately.
				const rotateByParentOrientationPost = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientationPost instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientationPost.setRotatingOrientation(false);
					rotateByParentOrientationPost.setCoverage(new Pioneer.Interval(T0 + 950.222, Number.POSITIVE_INFINITY));
				}
			}
		}, scene);
	}
}
