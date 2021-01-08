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
				coverages: [{
					interval: [null, T0 + 969.0]
				}],
				customUrl: true
			}, {
				url: 'assets/dynamo/sc_perseverance/ori',
				customUrl: true
			}],
			coverages: [{
				// When rover separates from descent stage, change the label and trail.
				coverage: [T0 + 933.497, Number.POSITIVE_INFINITY],
				enter: (entity) => {
					const div = entity.get('div');
					if (div instanceof Pioneer.DivComponent) {
						div.getDiv().innerHTML = 'Descent Stage';
					}
					const trail = entity.get('trail');
					if (trail instanceof Pioneer.TrailComponent) {
						trail.setRelativeTime(false);
						trail.setStartTime(T0);
						trail.setEndTime(T0 + 933.497); // rover separation
					}
				},
				exit: (entity) => {
					const div = entity.get('div');
					if (div instanceof Pioneer.DivComponent) {
						div.getDiv().innerHTML = 'Mars 2020';
					}
					const trail = entity.get('trail');
					if (trail instanceof Pioneer.TrailComponent) {
						trail.setRelativeTime(true);
						trail.setStartTime(10000000.0);
						trail.setEndTime(0);
					}
				}
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
					fixedPre.setOrientation(new Pioneer.Quaternion(0.8092756274728345, -0.4796625006256699, 0.3249889720674909, -0.09684530090043017));
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
						position: new Pioneer.Vector3(-498.2428551314156, -6039.068508016852, -113.90010223393193)
					});
					keyframePre.addPositionKeyframe(T0 + 0.000, {
						// UPDATE: Position of M20 at T0 + 0.000.
						position: new Pioneer.Vector3(659.3594036761485, -4745.765988033754, -483.6893172514795)
					});
				}
				// Dynamo doesn't quite get to the ground.
				const keyframePost = entity.addController('keyframe');
				keyframePost.setParent(mars);
				if (keyframePost instanceof Pioneer.KeyframeController) {
					keyframePost.addPositionKeyframe(T0 + 969.000, {
						// UPDATE: Position of M20 at T0 + 969.000.
						position: new Pioneer.Vector3(699.9282618101414, 3140.022745856009, 1075.148228997441)
					});
					keyframePost.addPositionKeyframe(T0 + 969.000 + 0.500, {
						position: new Pioneer.Vector3(699.9263438125089, 3140.0181573155814, 1075.1545236431045)
					});
					keyframePost.addOrientationKeyframe(T0 + 969.000, {
						// UPDATE: Orientation of M20 at T0 + 969.000.
						orientation: new Pioneer.Quaternion(0.4361985953702206, -0.6187150911204635, 0.4815552790814696, 0.4416185396986984)
					});
					keyframePost.addOrientationKeyframe(T0 + 969.000 + 0.500, {
						// UPDATE: Orientation of M20 at T0 + 969.000.
						orientation: new Pioneer.Quaternion(0.4361985953702206, -0.6187150911204635, 0.4815552790814696, 0.4416185396986984)
					});
				}
				// Its position needs to be relative to mars so that it flies appropriately.
				const rotateByParentOrientationPost = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientationPost instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientationPost.setRotatingOrientation(false);
					rotateByParentOrientationPost.setCoverage(new Pioneer.Interval(T0 + 969.000, T0 + 969.000 + 0.500));
				}
				// It's fixed on ground after this point.
				const fixedGround = entity.addController('fixed');
				if (fixedGround instanceof Pioneer.FixedController) {
					fixedGround.setPosition(new Pioneer.Vector3(699.9263438125089, 3140.0181573155814, 1075.1545236431045));
					// UPDATE: Orientation of M20 in Mars frame at T0 + 969.000 + 0.500.
					fixedGround.setOrientation(new Pioneer.Quaternion(0.07771742455276032, -0.8084333182508934, -0.4028005453548352, 0.42207498448093733));
					fixedGround.setParent(mars);
					fixedGround.setCoverage(new Pioneer.Interval(T0 + 969.000 + 0.500, Number.POSITIVE_INFINITY));
				}
				// Its position needs to be relative to mars so that it stays on the ground appropriately.
				const rotateByParentOrientationGround = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientationGround instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientationGround.setRotatingOrientation(true);
					rotateByParentOrientationGround.setCoverage(new Pioneer.Interval(T0 + 969.000 + 0.500, Number.POSITIVE_INFINITY));
				}
			}
		}, scene);

		// Cruise Stage
		Entity.createFromOptions('sc_perseverance_cruise_stage', {
			radius: 0.002,
			label: 'Cruise Stage',
			model: {
				url: 'assets/models/CruiseStage/edl2020_cruiseStage.gltf',
				useCompressedTextures: true,
				rotate: [
					{ x: -90 }
				]
			},
			fixed: {
				// UPDATE: Orientation of M20 at T0 - 60.000.
				orientation: new Pioneer.Quaternion(0.8092756274728345, -0.4796625006256698, 0.32498897206749106, -0.09684530090043)
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
						keyframe.addPositionKeyframe(T0 + 56.395, { // Balance mass ejection
							position: new Pioneer.Vector3(0.002, factor * 0.0002, 0.00065),
							relativeToEntityPosition: perseverance,
							relativeToEntityOrientation: perseverance
						});
						keyframe.addPositionKeyframe(T0 + 570.145, { // End point
							position: new Pioneer.Vector3(1, factor * 0.020, 0.00065),
							relativeToEntityPosition: perseverance,
							relativeToEntityPositionTime: T0 + 56.395,
							relativeToEntityOrientation: perseverance,
							relativeToEntityOrientationTime: T0 + 56.395
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
				useCompressedTextures: true,
				rotate: [
					{ x: -90 }
				]
			},
			dynamo: [{
				url: 'assets/dynamo/sc_perseverance_backshell/ori',
				customUrl: true
			}],
			postCreateFunction: (entity) => {
				// It's fixed to M20 until the separation point.
				const fixedAttached = entity.addController('fixed');
				if (fixedAttached instanceof Pioneer.FixedController) {
					fixedAttached.setPosition(Pioneer.Vector3.Zero);
					fixedAttached.setOrientation(Pioneer.Quaternion.Identity);
					fixedAttached.setParent(perseverance);
					fixedAttached.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 + 889.035));
				}
				const rotateByParentOrientationAttached = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientationAttached instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientationAttached.setRotatingOrientation(true);
					rotateByParentOrientationAttached.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 + 889.035));
				}
				// The separation keyframes.
				const keyframe = entity.addController('keyframe');
				keyframe.setParent(mars);
				if (keyframe instanceof Pioneer.KeyframeController) {
					keyframe.addPositionKeyframe(T0 + 889.035, { // Separation
						// UPDATE: M20 position in mars frame at T0 + 889.035.
						position: new Pioneer.Vector3(700.8357588368021, 3142.16472493506, 1075.087115041164)
					});
					keyframe.addPositionKeyframe(T0 + 889.035 + 53.432, { // Fly away further.
						position: new Pioneer.Vector3(700.9753580151794, 3140.3171146126915, 1073.4937970114418)
					});
				}
				// It's fixed on ground after this point.
				const fixedGround = entity.addController('fixed');
				if (fixedGround instanceof Pioneer.FixedController) {
					fixedGround.setPosition(new Pioneer.Vector3(700.9753580151794, 3140.3171146126915, 1073.4937970114418));
					// UPDATE: Backshell orientation in Mars frame at T0 + 889.035 + 53.432.
					fixedGround.setOrientation(new Pioneer.Quaternion(-0.2566301737304677, -0.538722076961457, -0.5959056867504157, 0.537415937820902));
					fixedGround.setParent(mars);
					fixedGround.setCoverage(new Pioneer.Interval(T0 + 889.035 + 53.432, Number.POSITIVE_INFINITY));
				}
				// Its position needs to be relative to mars so that it flies appropriately.
				const rotateByParentOrientationSeparated = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientationSeparated instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientationSeparated.setRotatingOrientation(false);
					rotateByParentOrientationSeparated.setCoverage(new Pioneer.Interval(T0 + 889.035, T0 + 889.035 + 53.432));
				}
				// Its position needs to be relative to mars on the ground.
				const rotateByParentOrientationFixed = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientationFixed instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientationFixed.setRotatingOrientation(true);
					rotateByParentOrientationFixed.setCoverage(new Pioneer.Interval(T0 + 889.035 + 53.432, Number.POSITIVE_INFINITY));
				}
			}
		}, scene);

		// Parachute Cap
		Entity.createFromOptions('sc_perseverance_chutecap', {
			radius: 0.0001,
			model: {
				url: 'assets/models/ChuteCap/edl2020_chuteCap.gltf',
				useCompressedTextures: true,
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
				useCompressedTextures: true,
				rotate: [
					{ x: -90 }
				]
			},
			coverages: [{
				coverage: [T0 + 889.035 + 53.432, Number.POSITIVE_INFINITY],
				enter: (entity) => {
					const model = entity.get('model');
					if (model instanceof Pioneer.ModelComponent) {
						model.setUrl('assets/models/ChuteCrumple/EDL2020_chuteCrumple.gltf');
					}
				},
				exit: (entity) => {
					const model = entity.get('model');
					if (model instanceof Pioneer.ModelComponent) {
						model.setUrl('assets/models/Chute/edl2020_chute.gltf');
					}
				}
			}],
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
			model: {
				url: 'assets/models/HeatShield/edl2020_heatshield.gltf',
				useCompressedTextures: true,
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
			}, { // Changing the texture to burnt when it enters the atmosphere.
				coverage: [T0 + 610.000, Number.POSITIVE_INFINITY],
				enter: (entity) => {
					const model = entity.get('model', 0);
					if (model instanceof Pioneer.ModelComponent) {
						const material = model.getMaterial('heat_shield_AO');
						if (material instanceof Pioneer.THREE.ShaderMaterial) {
							entity.getScene().getEngine().getTextureLoader().loadIntoUniform(material.uniforms.colorTexture, 'assets/models/HeatShield/heat_shield_AO_burnt.png', false, true);
						}
					}
				},
				exit: (entity) => {
					const model = entity.get('model', 0);
					if (model instanceof Pioneer.ModelComponent) {
						const material = model.getMaterial('heat_shield_AO');
						if (material instanceof Pioneer.THREE.ShaderMaterial) {
							entity.getScene().getEngine().getTextureLoader().loadIntoUniform(material.uniforms.colorTexture, 'assets/models/HeatShield/heat_shield_AO.png', false, true);
						}
					}
				}
			}],
			postCreateFunction: (entity) => {
				// Setup texture change for main model.
				const model = entity.get('model', 0);
				if (model instanceof Pioneer.ModelComponent) {
					model.setMeshCreatedCallback(() => {
						const material = model.getMaterial('heat_shield_AO');
						if (material instanceof Pioneer.THREE.ShaderMaterial) {
							const burnt = (entity.getScene().getEngine().getTime() >= T0 + 610.000) ? '_burnt' : '';
							entity.getScene().getEngine().getTextureLoader().loadIntoUniform(material.uniforms.colorTexture, 'assets/models/HeatShield/heat_shield_AO' + burnt + '.png', false, true);
						}
					});
				}
				// Add entry burn model.
				const entryBurnModel = entity.addComponent('model', 'entryBurn');
				if (model instanceof Pioneer.ModelComponent && entryBurnModel instanceof Pioneer.ModelComponent) {
					entryBurnModel.setUrl('assets/models/Entry_Burn/edl2020_entryBurn.gltf');
					entryBurnModel.setRotation(model.getRotation());
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
						position: new Pioneer.Vector3(705.6134199726483, 3148.089861491276, 1078.4971021783292)
					});
					keyframe.addPositionKeyframe(T0 + 804.269 + 15.000, { // Fly away somewhere.
						position: new Pioneer.Vector3(702.4418208779947, 3145.9844968597126, 1076.5851208833976)
					});
					keyframe.addPositionKeyframe(T0 + 804.269 + 50.000, { // Fly away further.
						position: new Pioneer.Vector3(699.9077300645706, 3140.597445997733, 1073.3802665247613)
					});
				}
				// It starts oriented with M20 and then spins away from there.
				const fixedSeparated = entity.addController('fixed');
				if (fixedSeparated instanceof Pioneer.FixedController) {
					// UPDATE: M20 Orientation at T0 + 804.269
					fixedSeparated.setOrientation(new Pioneer.Quaternion(0.06011512681638599, -0.011747375598459526, -0.6549298825790744, -0.7532031728553449));
					fixedSeparated.setCoverage(new Pioneer.Interval(T0 + 804.269, Number.POSITIVE_INFINITY));
				}
				const spin = entity.addController('spin');
				if (spin instanceof Pioneer.SpinController) {
					spin.setAxis(new Pioneer.Vector3(0, 1, 0), true);
					spin.setRate(0.1);
					spin.setReferenceTime(T0 + 804.269);
					spin.setReferenceAngle(0.0);
					spin.setCoverage(new Pioneer.Interval(T0 + 804.269, T0 + 804.269 + 50.000));
				}
				// Its position needs to be relative to mars so that it flies appropriately.
				const rotateByParentOrientationSeparated = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientationSeparated instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientationSeparated.setRotatingOrientation(false);
					rotateByParentOrientationSeparated.setCoverage(new Pioneer.Interval(T0 + 804.269, T0 + 804.269 + 50.000));
				}
				// It's fixed on ground after this point.
				const fixedGround = entity.addController('fixed');
				if (fixedGround instanceof Pioneer.FixedController) {
					fixedGround.setParent(mars);
					fixedGround.setPosition(new Pioneer.Vector3(699.9077300645706, 3140.597445997733, 1073.3802665247613));
					// UPDATE: M20 Orientation in Mars frame at T0 + 804.269 + 50.000.
					fixedGround.setOrientation(new Pioneer.Quaternion(-0.1542819752354937, -0.3597189432276211, 0.5045895327243909, 0.7695380156078185));
					fixedGround.setCoverage(new Pioneer.Interval(T0 + 804.269 + 50.000, Number.POSITIVE_INFINITY));
				}
				// Its position needs to be relative to mars so that it flies appropriately.
				const rotateByParentOrientationGround = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientationGround instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientationGround.setRotatingOrientation(true);
					rotateByParentOrientationGround.setCoverage(new Pioneer.Interval(T0 + 804.269 + 50.000, Number.POSITIVE_INFINITY));
				}
			}
		}, scene);

		// Rover
		Entity.createFromOptions('sc_perseverance_rover', {
			radius: 0.002,
			label: 'Perseverance',
			model: {
				url: 'assets/models/Perse/edl2020_perse.gltf',
				useCompressedTextures: true,
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
				// It's fixed to M20.
				const fixed = entity.addController('fixed');
				if (fixed instanceof Pioneer.FixedController) {
					fixed.setPosition(Pioneer.Vector3.Zero);
					fixed.setOrientation(Pioneer.Quaternion.Identity);
					fixed.setParent('sc_perseverance');
					fixed.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 + 933.497));
				}
				const rotateByParentOrientation = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientation instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientation.setRotatingOrientation(true);
					rotateByParentOrientation.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 + 933.497));
				}
				// It's fixed on ground after this point.
				const fixedGround = entity.addController('fixed');
				if (fixedGround instanceof Pioneer.FixedController) {
					fixedGround.setParent(mars);
					// UPDATE: M20 rover position and orientation in mars frame at T0 + 949.453 - 0.00001.
					fixedGround.setPosition(new Pioneer.Vector3(700.0259971377374, 3140.147204279965, 1074.6137468717366));
					fixedGround.setOrientation(new Pioneer.Quaternion(-0.3687957252164953, -0.6453124355946519, -0.5010749764034842, 0.44326678372193135));
					fixedGround.setCoverage(new Pioneer.Interval(T0 + 949.453, Number.POSITIVE_INFINITY));
				}
				// Its position needs to be relative to mars so that it flies appropriately.
				const rotateByParentOrientationSeparated = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientationSeparated instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientationSeparated.setRotatingOrientation(true);
					rotateByParentOrientationSeparated.setCoverage(new Pioneer.Interval(T0 + 949.453, Number.POSITIVE_INFINITY));
				}
				// Add the model animations.
				const modelAnimate = entity.addController('modelAnimate');
				const model = entity.get('model');
				if (model instanceof Pioneer.ModelComponent && modelAnimate instanceof Pioneer.ModelAnimateController) {
					modelAnimate.setAnimation(model, 'susp_arm_f_l', 'susp_arm_f_lAction.002', new Pioneer.Interval(T0 + 933.497 + 1.000, T0 + 933.497 + 5.000));
					modelAnimate.setAnimation(model, 'susp_arm_f_r', 'susp_arm_f_rAction.002', new Pioneer.Interval(T0 + 933.497 + 1.000, T0 + 933.497 + 5.000));
					modelAnimate.setAnimation(model, 'susp_arm_m_l', 'susp_arm_m_lAction.002', new Pioneer.Interval(T0 + 933.497 + 1.000, T0 + 933.497 + 5.000));
					modelAnimate.setAnimation(model, 'susp_arm_m_r', 'susp_arm_m_rAction.002', new Pioneer.Interval(T0 + 933.497 + 1.000, T0 + 933.497 + 5.000));
					modelAnimate.setAnimation(model, 'susp_arm_b_l', 'susp_arm_b_lAction.001', new Pioneer.Interval(T0 + 933.497 + 1.000, T0 + 933.497 + 5.000));
					modelAnimate.setAnimation(model, 'susp_arm_b_r', 'susp_arm_b_rAction.001', new Pioneer.Interval(T0 + 933.497 + 1.000, T0 + 933.497 + 5.000));
					modelAnimate.setAnimation(model, 'susp_steer_f_l', 'susp_steer_f_lAction.001', new Pioneer.Interval(T0 + 933.497 + 1.000, T0 + 933.497 + 5.000));
					modelAnimate.setAnimation(model, 'susp_steer_f_r', 'susp_steer_f_rAction.001', new Pioneer.Interval(T0 + 933.497 + 1.000, T0 + 933.497 + 5.000));
				}
				// Add coverage for the offsets of the rover mesh so that it lines up with the IGP point.
				const coverage = entity.addController('coverage');
				if (coverage instanceof Pioneer.CoverageController) {
					coverage.addCoverage(new Pioneer.Interval(T0 + 933.497, Number.POSITIVE_INFINITY), undefined,
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
				useCompressedTextures: true,
				rotate: [
					{ x: -90 }
				]
			},
			coverages: [{
				// Turn on the thrusters and plumes right after the backshell separates.
				coverage: [T0 + 889.035 + 0.5, T0 + 956.855],
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
				coverage: [T0 + 933.497 - 1.5, T0 + 956.855],
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
			}, {
				coverage: [T0 + 949.453, Number.POSITIVE_INFINITY],
				enter: (entity) => {
					entity.getComponentByType('connectedSprite', 0).setEnabled(false);
					entity.getComponentByType('connectedSprite', 1).setEnabled(false);
					entity.getComponentByType('connectedSprite', 2).setEnabled(false);
					entity.getComponentByType('connectedSprite', 3).setEnabled(false);
				},
				exit: (entity) => {
					entity.getComponentByType('connectedSprite', 0).setEnabled(true);
					entity.getComponentByType('connectedSprite', 1).setEnabled(true);
					entity.getComponentByType('connectedSprite', 2).setEnabled(true);
					entity.getComponentByType('connectedSprite', 3).setEnabled(true);
				}
			}],
			postCreateFunction: async (entity) => {
				// Add thruster and plume models.
				const thrustersModel = entity.addComponent('model');
				const model = entity.get('model', 0);
				if (model instanceof Pioneer.ModelComponent && thrustersModel instanceof Pioneer.ModelComponent) {
					thrustersModel.setUrl('assets/models/SkyCrane_Thrusters/edl2020_skyCraneThrusters.gltf');
					thrustersModel.setRotation(model.getRotation());
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
				if (model instanceof Pioneer.ModelComponent && plumesModel instanceof Pioneer.ModelComponent) {
					plumesModel.setUrl('assets/models/SkyCrane_Plumes/edl2020_skyCranePlumes.gltf');
					plumesModel.setRotation(model.getRotation());
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
					cable.setTextureUrl('assets/models/Cables/cable.png');
					cable.setEntity1(entity);
					cable.setEntity1Offset(new Pioneer.Vector3(0.00049103, -0.000082696, 0.00040494));
					cable.setEntity2(scene.getEntity('sc_perseverance_rover'));
					cable.setEntity2Offset(new Pioneer.Vector3(0.000635, 0, -0.00030));
					cable.setWidth('0.0001');
					cable.setTextureRepeat(false);
				}
				const rope1 = entity.addComponent('connectedSprite');
				if (rope1 instanceof Pioneer.ConnectedSpriteComponent) {
					rope1.setTextureUrl('assets/models/Cables/rope.png');
					rope1.setEntity1(entity);
					rope1.setEntity1Offset(new Pioneer.Vector3(0.000006286, 0.000001785, 0.00014488));
					rope1.setEntity2(scene.getEntity('sc_perseverance_rover'));
					rope1.setEntity2Offset(new Pioneer.Vector3(0.00044, 0, -0.00047));
					rope1.setWidth('0.0001');
					rope1.setTextureRepeat(false);
				}
				const rope2 = entity.addComponent('connectedSprite');
				if (rope2 instanceof Pioneer.ConnectedSpriteComponent) {
					rope2.setTextureUrl('assets/models/Cables/rope.png');
					rope2.setEntity1(entity);
					rope2.setEntity1Offset(new Pioneer.Vector3(0.000006286, 0.000001785, 0.00014488));
					rope2.setEntity2(scene.getEntity('sc_perseverance_rover'));
					rope2.setEntity2Offset(new Pioneer.Vector3(-0.00022, 0.00038, -0.00047));
					rope2.setWidth('0.0001');
					rope2.setTextureRepeat(false);
				}
				const rope3 = entity.addComponent('connectedSprite');
				if (rope3 instanceof Pioneer.ConnectedSpriteComponent) {
					rope3.setTextureUrl('assets/models/Cables/rope.png');
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
					fixed.setCoverage(new Pioneer.Interval(T0 - 360.000, T0 + Number.POSITIVE_INFINITY));
				}
				const rotateByParentOrientation = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientation instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientation.setRotatingOrientation(true);
					rotateByParentOrientation.setCoverage(new Pioneer.Interval(T0 - 360.000, Number.POSITIVE_INFINITY));
				}
			}
		}, scene);
	}
}
