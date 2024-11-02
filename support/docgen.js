/**
 * This script generates the supported devices page.
 *


let devices = [...require('zigbee-herdsman-converters').devices];

for (const device of devices) {
    if (device.whiteLabel) {
        for (const whiteLabel of device.whiteLabel) {
            const whiteLabelDevice = {
                ...device,
                model: whiteLabel.model,
                vendor: whiteLabel.vendor,
                description: whiteLabel.description,
                whiteLabelOf: device,
            };

            delete whiteLabelDevice.whiteLabel;

            devices.push(whiteLabelDevice);
        }
    }
}

devices = new Map(devices.map((d) => [d.model, d]));

const Devices = require('../lib/devices');
let iobDevices = Devices.devices;
Devices.fillStatesWithExposes('');

const iobCount = iobDevices.filter((d) => (!d.exposed)).length;
iobDevices = new Map(iobDevices.map((d) => d.models.map((m) => [m, d])).flat());

const fs = require('fs');
const outputdir = process.argv[2];

if (!outputdir) {
    console.error('Please specify an output directory');
}

const file = 'Supported-devices.md';
let text = `*NOTE: Automatically generated by 'npm run docgen'* \n\n` +
    `Currently **${iobDevices.size}**(${iobCount} described in adapter) devices are supported.\n\n` +
    `(⭐EXP) - means that the device is presented automatically, based on the 'exposes' from the zigbee-herdsman-converters.\n\n`;

const logDevices = (devmodels) => {
    let result = '';

    devmodels.forEach((devmodel) => {
        const iobDevice = iobDevices.get(devmodel);
        const device = devices.get(devmodel);
        const pathImg = (iobDevice.icon.startsWith('http')) ? devmodel : iobDevice.icon.replace(new RegExp('img/', 'g'), '').replace(new RegExp('.png', 'g'), '');
        const icon = (iobDevice.icon.startsWith('http')) ? iobDevice.icon : `https://github.com/ioBroker/ioBroker.zigbee/raw/master/admin/${iobDevice.icon}`;
        let brand;
        const models = [];
        let zmodels;
        if (device.zigbeeModel) {
            zmodels = device.zigbeeModel;
        } else {
            zmodels = [devmodel];
        }
        zmodels.forEach((modelId) => {
            const re = /[^\x20-\x7E]+/g;
            const model = modelId.replace(re, ' ');
            const desc = `${device.description} (${device.supports})`;
            const name = `**${device.model}${(iobDevice.exposed) ? ' (⭐EXP)': ''}**<br>`;
            if (brand == undefined) {
                brand= {
                    name: name,
                    desc: desc,
                    pathImg: pathImg,
                };
            }
            models.push(model);
        });
        const modelsStr = models.join(', ');
        result += `| ${brand.name} (${modelsStr}) | ${brand.desc} |  ![${brand.pathImg}](${icon}) |\n`;
    });

    return result;
};

const vendors = Array.from(new Set([...iobDevices.keys()].map((m) => (devices.get(m)) ? devices.get(m).vendor : null)));
vendors.sort();
text += '|  Model | Description | Picture |\n';
text += '| ------------- | ------------- | -------------------------- |\n';
vendors.forEach((vendor) => {
    text += `|  | **${vendor}**  |   |\n`;
    text += logDevices([...iobDevices.keys()].map((m) => devices.get(m)).filter((d) => d && d.vendor === vendor).map((d) => d.model));
});

fs.writeFileSync(outputdir + '/' + file, text);

 */
