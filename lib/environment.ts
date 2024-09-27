// import { ec2instanceprops } from './cdk_javascript-stack';

// export enum InstanceSize {
//     'LARGE' = 'large',
//     'XLARGE' = 'xlarge',
//     'XLARGE2' = 'xlarge2',
//     'XLARGE4' = 'xlarge4',
//   }
//   export enum CPUTypes {
//     'X86' = 'x86',
//     'ARM64' = 'arm64',
//   }

//   export function envValidator(props: ec2instanceprops) {
//     const validCPUTypes = Object.keys(CPUTypes).join(', ');
//     if(props.CPUTypes) {
//         if(props.CPUTypes !== CPUTypes.X86 && props.CPUTypes !== CPUTypes.ARM64) {
//             throw new Error(`Invalid CPU type. Valid options are: ${validCPUTypes}`);
//         }
//     }
//     if(props.InstanceSize) {
//         const validSizes = Object.keys(InstanceSize).join(', ');
//         if(props.InstanceSize !== InstanceSize.LARGE && props.InstanceSize !== InstanceSize.XLARGE && props.InstanceSize !== InstanceSize.XLARGE2 && props.InstanceSize !== InstanceSize.XLARGE4) {
//             throw new Error(`Invalid Instance Size. Valid options are: ${validSizes}`);
//         }
//     }
//   }