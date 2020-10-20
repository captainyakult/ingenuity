import * as Pioneer from 'pioneer-js';
import { Entity } from 'pioneer-scripts';

export class SetupSpacecraft {
	/**
	 * Sets up the spacecraft and all of the parts.
	 * @param {Pioneer.Scene} scene
	 */
	static setup(scene) {
		// Create the rover.
		const perseverance = Entity.createFromOptions('sc_perseverance', {
			radius: 0.0045,
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
				entity.addComponent('gizmo').setSize(0.002);
				// Make the tail relative to mars orientation.
				const trail = entity.get('trail');
				if (trail instanceof Pioneer.TrailComponent) {
					trail.setRelativeToParentOrientation(true);
					trail.resetPoints();
				}
				const fixed = entity.addController('fixed');
				if (fixed instanceof Pioneer.FixedController) {
					fixed.setCoverage(new Pioneer.Interval(Number.NEGATIVE_INFINITY, 666952142.045910));
					// UPDATE: Orientation of M20 at 666952142.045910.
					fixed.setOrientation(new Pioneer.Quaternion(0.8119723535749122, -0.4708320053648108, 0.33622975501683444, -0.0772507061164374));
				}

				const spin = entity.addController('spin');
				if (spin instanceof Pioneer.SpinController) {
					spin.setCoverage(new Pioneer.Interval(Number.NEGATIVE_INFINITY, 666952142.045910));
					spin.setAxis(new Pioneer.Vector3(0, 0, 1), true);
					spin.setRate(2 * Math.PI / 30); // 30 rotations per hour.
					spin.setReferenceTime(666952142.045910);
					spin.setReferenceAngle(0.0);
				}
				const keyframe = entity.addController('keyframe');
				keyframe.setParent('mars');
				if (keyframe instanceof Pioneer.KeyframeController) {
					keyframe.addPositionKeyframe(666952142.045910 - 360.000, {
						// UPDATE: Position of M20 at 666952142.045910 - 360 * velocity of M20.
						position: new Pioneer.Vector3(-497.3386139938947, -6039.217708641134, -114.29456408530791)
					});
					keyframe.addPositionKeyframe(666952142.045910 + 0.000, {
						// UPDATE: Position of M20 at 666952142.045910.
						position: new Pioneer.Vector3(660.0988417230172, -4745.529644716592, -483.9787740323323)
					});
				}
			}
		}, scene);

		// Create other Mars2020 parts
		Entity.createFromOptions('sc_perseverance_cruise_stage', {
			radius: 0.002,
			label: 'Cruise Stage',
			model: {
				url: '$STATIC_ASSETS_URL/models/sc_perseverance/edl/CruiseStage/edl2020_cruiseStage.gltf',
				rotate: [
					{ x: -90 }
				]
			},
			fixed: {
				// UPDATE: Orientation of M20 at 666952142.045910.
				orientation: new Pioneer.Quaternion(0.8119723535749122, -0.4708320053648108, 0.33622975501683444, -0.0772507061164374)
			},
			postCreateFunction: (entity) => {
				entity.addComponent('gizmo');
				const spin = entity.addController('spin');
				if (spin instanceof Pioneer.SpinController) {
					spin.setAxis(new Pioneer.Vector3(0, 0, 1), true);
					spin.setRate(2 * Math.PI / 30); // 30 rotations per hour.
					spin.setReferenceTime(666952142.045910);
					spin.setReferenceAngle(0.0);
				}
				const keyframe = entity.addController('keyframe');
				keyframe.setParent('sc_perseverance');
				if (keyframe instanceof Pioneer.KeyframeController) {
					keyframe.addPositionKeyframe(666952142.045910 - 360.000, { // Beginning
						position: Pioneer.Vector3.Zero,
						relativeToEntityPosition: perseverance
					});
					keyframe.addPositionKeyframe(666952142.045910 + 0.000, { // Start of separation (to make it a sharp change)
						position: Pioneer.Vector3.Zero,
						relativeToEntityPosition: perseverance
					});
					keyframe.addPositionKeyframe(666952142.045910 + 0.000, { // Separation
						position: Pioneer.Vector3.Zero,
						relativeToEntityPosition: perseverance
					});
					keyframe.addPositionKeyframe(666952142.045910 + 60.000, { // Separate back.
						position: new Pioneer.Vector3(0, 0, -0.120),
						relativeToEntityPosition: perseverance,
						relativeToEntityOrientation: perseverance,
						relativeToEntityOrientationTime: 666952142.045910 + 0.000
					});
					keyframe.addPositionKeyframe(666952142.045910 + 360.000, { // Further back.
						position: new Pioneer.Vector3(0, 0, -2.440),
						relativeToEntityPosition: perseverance,
						relativeToEntityOrientation: perseverance,
						relativeToEntityOrientationTime: 666952142.045910 + 0.000
					});
					keyframe.addPositionKeyframe(666952142.045910 + 693.000, { // And further back.
						position: new Pioneer.Vector3(0, 0, -28.00),
						relativeToEntityPosition: perseverance,
						relativeToEntityOrientation: perseverance,
						relativeToEntityOrientationTime: 666952142.045910 + 0.000
					});
					keyframe.addPositionKeyframe(666952142.045910 + 800.000, { // Way back and disappear.
						position: new Pioneer.Vector3(0, 0, -70.386),
						relativeToEntityPosition: perseverance,
						relativeToEntityOrientation: perseverance,
						relativeToEntityOrientationTime: 666952142.045910 + 0.000
					});
				}
			}
		}, scene);

		for (let i = 0; i < 2; i++) {
			Entity.createFromOptions('sc_perseverance_ballast_' + i, {
				radius: 0.0001,
				label: 'Balance Mass',
				fixed: {
					orientation: Pioneer.Quaternion.Identity
				},
				postCreateFunction: (entity) => {
					entity.addComponent('gizmo');
					const keyframe = entity.addController('keyframe');
					keyframe.setParent('sc_perseverance');
					if (keyframe instanceof Pioneer.KeyframeController) {
						const factor = 2.0 * (i - 0.5);
						keyframe.addPositionKeyframe(666952142.045910 + 57.145, { // Balance mass ejection
							position: new Pioneer.Vector3(0.002, factor * 0.0002, 0.00065),
							relativeToEntityPosition: perseverance,
							relativeToEntityOrientation: perseverance,
							relativeToEntityPositionTime: 666952142.045910 + 57.145
						});
						keyframe.addPositionKeyframe(666952142.045910 + 570.145, { // End point
							position: new Pioneer.Vector3(1, factor * 0.020, 0.00065),
							relativeToEntityPosition: perseverance,
							relativeToEntityOrientation: perseverance,
							relativeToEntityPositionTime: 666952142.045910 + 57.145
						});
					}
				}
			}, scene);
		}

		Entity.createFromOptions('sc_perseverance_backshell', {
			radius: 0.002,
			label: 'Backshell',
			model: {
				url: '$STATIC_ASSETS_URL/models/sc_perseverance/edl/Backshell/edl2020_backshell.gltf',
				rotate: [
					{ x: -90 }
				]
			},
			postCreateFunction: (entity) => {
				entity.addComponent('gizmo');
				// It's fixed to M20 until the separation point.
				const fixed = entity.addController('fixed');
				if (fixed instanceof Pioneer.FixedController) {
					fixed.setPosition(Pioneer.Vector3.Zero);
					fixed.setOrientation(Pioneer.Quaternion.Identity);
					fixed.setParent(perseverance);
					fixed.setCoverage(new Pioneer.Interval(Number.NEGATIVE_INFINITY, 666952142.045910 + 883.910));
				}
				const rotateByParentOrientation = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientation instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientation.setRotatingOrientation(true);
					rotateByParentOrientation.setCoverage(new Pioneer.Interval(Number.NEGATIVE_INFINITY, 666952142.045910 + 883.910));
				}
				const keyframe = entity.addController('keyframe');
				keyframe.setParent('sc_perseverance');
				if (keyframe instanceof Pioneer.KeyframeController) {
					keyframe.addPositionKeyframe(666952142.045910 + 883.910, { // Separation
						// UPDATE: M20 position in mars frame at 666952142.045910 + 883.910.
						position: new Pioneer.Vector3(705.4173775967454, 3148.3125455180652, 1078.3568188244858)
					});
					keyframe.addPositionKeyframe(666952142.045910 + 883.910 + 15, { // Fly away somewhere.
						position: new Pioneer.Vector3(701.8115386143, 3146.9400091443517, 1077.0614178671635)
					});
					keyframe.addPositionKeyframe(666952142.045910 + 883.910 + 60, { // Fly away further.
						position: new Pioneer.Vector3(697.3095054985714, 3140.397514639459, 1074.5853716673646)
					});
				}
				// It starts oriented with M20 and then wobbles from there.
				const fixed2 = entity.addController('fixed');
				if (fixed2 instanceof Pioneer.FixedController) {
					// UPDATE: M20 Orientation at 666952142.045910 + 883.910
					fixed2.setOrientation(new Pioneer.Quaternion(0.22625090155393868, -0.13412872057444253, -0.6629007965425562, -0.7009868399665845));
					fixed2.setCoverage(new Pioneer.Interval(666952142.045910 + 883.910, 666952142.045910 + 883.910 + 60.0));
				}
				// Its position needs to be relative to mars so that it flies appropriately.
				const rotateByParentOrientation2 = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientation2 instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientation2.setRotatingOrientation(false);
					rotateByParentOrientation2.setCoverage(new Pioneer.Interval(666952142.045910 + 883.910, 666952142.045910 + 883.910 + 60.0));
				}
				const spin = entity.addController('spin');
				if (spin instanceof Pioneer.SpinController) {
					spin.setAxis(new Pioneer.Vector3(0.1, 0.0, 0.9949874371), true);
					spin.setRate(0.3);
					spin.setReferenceTime(666952142.045910 + 883.910);
					spin.setReferenceAngle(0.0);
					spin.setCoverage(new Pioneer.Interval(666952142.045910 + 883.910, 666952142.045910 + 883.910 + 60.0));
				}
			}
		}, scene);

		Entity.createFromOptions('sc_perseverance_chutecap', {
			radius: 0.002,
			model: {
				url: '$STATIC_ASSETS_URL/models/sc_perseverance/edl/ChuteCap/edl2020_chuteCap.gltf',
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
					fixed.setCoverage(new Pioneer.Interval(Number.NEGATIVE_INFINITY, 666952142.045910 + 782.025 - 2.000));
				}
				const rotateByParentOrientation = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientation instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientation.setRotatingOrientation(true);
					rotateByParentOrientation.setCoverage(new Pioneer.Interval(Number.NEGATIVE_INFINITY, 666952142.045910 + 782.025 - 2.000));
				}
			}
		}, scene);

		Entity.createFromOptions('sc_perseverance_heat_shield', {
			radius: 0.002,
			label: 'Heatshield',
			model: {
				url: '$STATIC_ASSETS_URL/models/sc_perseverance/edl/HeatShield/edl2020_heatshield.gltf',
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
					fixed.setCoverage(new Pioneer.Interval(Number.NEGATIVE_INFINITY, 666952142.045910 + 802.519));
				}
				const rotateByParentOrientation = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientation instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientation.setRotatingOrientation(true);
					rotateByParentOrientation.setCoverage(new Pioneer.Interval(Number.NEGATIVE_INFINITY, 666952142.045910 + 802.519));
				}

				// Add keyframes for separation.
				const keyframe = entity.addController('keyframe');
				keyframe.setParent('mars');
				if (keyframe instanceof Pioneer.KeyframeController) {
					keyframe.addPositionKeyframe(666952142.045910 + 802.519, { // Separation
						// UPDATE: M20 position in mars frame at 666952142.045910 + 802.519.
						position: new Pioneer.Vector3(705.4173775967454, 3148.3125455180652, 1078.3568188244858)
					});
					keyframe.addPositionKeyframe(666952142.045910 + 802.519 + 15, { // Fly away somewhere.
						position: new Pioneer.Vector3(701.8115386143, 3146.9400091443517, 1077.0614178671635)
					});
					keyframe.addPositionKeyframe(666952142.045910 + 802.519 + 60, { // Fly away further.
						position: new Pioneer.Vector3(697.3095054985714, 3140.397514639459, 1074.5853716673646)
					});
				}
				// Its position needs to be relative to mars so that it flies appropriately.
				const rotateByParentOrientation2 = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientation2 instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientation2.setRotatingOrientation(false);
					rotateByParentOrientation2.setCoverage(new Pioneer.Interval(666952142.045910 + 802.519, 666952142.045910 + 802.519 + 60.0));
				}
				// It starts oriented with M20 and then spins away from there.
				const fixed2 = entity.addController('fixed');
				if (fixed2 instanceof Pioneer.FixedController) {
					// UPDATE: M20 Orientation at 666952142.045910 + 802.519
					fixed2.setOrientation(new Pioneer.Quaternion(0.22625090155393868, -0.13412872057444253, -0.6629007965425562, -0.7009868399665845));
					fixed2.setCoverage(new Pioneer.Interval(666952142.045910 + 802.519, 666952142.045910 + 802.519 + 60.0));
				}
				const spin = entity.addController('spin');
				if (spin instanceof Pioneer.SpinController) {
					spin.setAxis(new Pioneer.Vector3(0, 1, 0), true);
					spin.setRate(10.0);
					spin.setReferenceTime(666952142.045910 + 802.519);
					spin.setReferenceAngle(0.0);
					spin.setCoverage(new Pioneer.Interval(666952142.045910 + 802.519, 666952142.045910 + 802.519 + 60.0));
				}
				// Add coverage for the offsets of the heat shield mesh so that it rotates around its center when flying off.
				const coverage = entity.addController('coverage');
				if (coverage instanceof Pioneer.CoverageController) {
					coverage.addCoverage(new Pioneer.Interval(666952142.045910 + 802.519, 666952142.045910 + 802.519 + 60), undefined,
						(entity) => { // exit
							const model = entity.getComponentByType('model');
							if (model instanceof Pioneer.ModelComponent) {
								if (model.getRoot() !== null) {
									model.getRoot().children[0].children[0].position.set(0, 0, 0);
								}
							}
						}, (entity) => { // update
							const model = entity.getComponentByType('model');
							if (model instanceof Pioneer.ModelComponent) {
								if (model.getRoot() !== null) {
									const lerpOffset = Pioneer.MathUtils.clamp01((entity.getScene().getEngine().getTime() - (666952142.045910 + 802.519)) / 1.0);
									// UPDATE: If heat shield mesh offset changes, update it here.
									model.getRoot().children[0].children[0].position.set(0, 1.20 * lerpOffset, 0);
								}
							}
						});
				}
			}
		}, scene);

		Entity.createFromOptions('sc_perseverance_parachute', {
			radius: 0.002,
			label: 'Heatshield',
			model: {
				url: '$STATIC_ASSETS_URL/models/sc_perseverance/edl/Chute/edl2020_chute.gltf',
				rotate: [
					{ x: -90 }
				]
			},
			postCreateFunction: (entity) => {
				// It's fixed to M20.
				const fixed = entity.addController('fixed');
				if (fixed instanceof Pioneer.FixedController) {
					fixed.setPosition(Pioneer.Vector3.Zero);
					fixed.setOrientation(Pioneer.Quaternion.Identity);
					fixed.setParent(scene.get('sc_perseverance_backshell'));
					fixed.setCoverage(new Pioneer.Interval(666952142.045910 + 782.025, Number.POSITIVE_INFINITY));
				}
				const rotateByParentOrientation = entity.addController('rotateByParentOrientation');
				if (rotateByParentOrientation instanceof Pioneer.RotateByParentOrientationController) {
					rotateByParentOrientation.setRotatingOrientation(true);
					rotateByParentOrientation.setCoverage(new Pioneer.Interval(666952142.045910 + 782.025, Number.POSITIVE_INFINITY));
				}
			}
		}, scene);
	}
}
