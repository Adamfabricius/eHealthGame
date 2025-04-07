class eHealthGame extends Phaser.Scene {
    constructor() {
        super({ key: 'eHealthGame' });
    }

    preload() {
        console.log("Laddar resurser...");
    }

    create() {
        this.cameras.main.setBackgroundColor('#d3d0d0');
        console.log("Spelet har startat!");

        // Skapa policyer och deras effekter
        this.policies = [
            { name: 'Digital Journals', effectYoung: 10, effectOld: -5 },
            { name: 'Telemedicine', effectYoung: 5, effectOld: 15 },
            { name: 'AI Diagnosis', effectYoung: 15, effectOld: -10 }
        ];

        // Startvärden för nöjdhet
        this.youngSatisfaction = 50;
        this.oldSatisfaction = 50;

        // Text för att visa användarens val
        this.add.text(50, 50, 'Välj en eHälsa-policy:', { fontSize: '24px', fill: '#000' });

        // Skapa knappar för att välja policy
        this.policies.forEach((policy, index) => {
            // Placera policyerna nära varandra
            const yPos = 100 + index * 50;
            this.add.text(125, yPos, policy.name, { fontSize: '20px', fill: '#007BFF' })
                .setInteractive({ useHandCursor: true }) 
                .on('pointerdown', () => this.applyPolicy(policy));

            // Skapa minus och plus knappar på samma rad
            this.createAdjustButtons(policy, yPos);
        });

        // Skapa sliders för unga och äldre nöjdhet
        this.youngSlider = this.add.graphics();
        this.oldSlider = this.add.graphics();
        this.updateSlider(this.youngSlider, this.youngSatisfaction, 300);
        this.updateSlider(this.oldSlider, this.oldSatisfaction, 350);

        // Text för att beskriva sliders
        this.youngText = this.add.text(50, 300, `Unga nöjdhet:`, { fontSize: '20px', fill: '#000' });
        this.oldText = this.add.text(50, 350, `Äldre nöjdhet:`, { fontSize: '20px', fill: '#000' });
    }

    update() {
        // Färgsättningen av sliders baserat på nöjdhet
        this.updateSlider(this.youngSlider, this.youngSatisfaction, 300);
        this.updateSlider(this.oldSlider, this.oldSatisfaction, 350);
    }

    applyPolicy(policy) {
        // Tillämpa policy-effekter och begränsa värden mellan 0 och 100
        this.youngSatisfaction = Phaser.Math.Clamp(this.youngSatisfaction + policy.effectYoung, 0, 100);
        this.oldSatisfaction = Phaser.Math.Clamp(this.oldSatisfaction + policy.effectOld, 0, 100);

        // Uppdatera text för nöjdhet
        this.youngText.setText(`Unga nöjdhet: ${this.youngSatisfaction}`);
        this.oldText.setText(`Äldre nöjdhet: ${this.oldSatisfaction}`);
    }

    updateSlider(slider, value, yPosition) {
        // Rensa tidigare grafik
        slider.clear();

        // Beräkna färgen baserat på värdet
        let color = this.getSliderColor(value);

        // Rita själva sliden
        slider.fillStyle(color, 1);
        slider.fillRect(300, yPosition, value * 5, 20); // Sliden är 5px per värdenhet

        // Sätt en ram för att visa sliden
        slider.lineStyle(2, 0x000000, 1);
        slider.strokeRect(300, yPosition, 500, 20);
    }

    getSliderColor(value) {
        // Bestäm färg baserat på värdet
        if (value <= 25) {
            return 0xff0000; // Röd
        } else if (value <= 49) {
            return 0xffff00; // Gul
        } else if (value <= 75) {
            return 0x66ff66; // Ljusgrön
        } else {
            return 0x00ff00; // Mörkgrön
        }
    }

    createAdjustButtons(policy, yPosition) {
        // Skapa minus- och plus-knappar för att justera policy-effekterna
        this.add.text(50, yPosition, '-', { fontSize: '24px', fill: '#ff0000' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.adjustPolicy(policy, -1));

        this.add.text(350, yPosition, '+', { fontSize: '24px', fill: '#4db937' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.adjustPolicy(policy, 1));
    }

    adjustPolicy(policy, direction) {
        if (direction === 1) {
            // Plus-knapp: Tillämpa de ursprungliga effekterna
            this.applyEffect(policy, 1);
        } else if (direction === -1) {
            // Minus-knapp: Tillämpa de motsatta effekterna
            this.applyEffect(policy, -1);
        }
    }

    applyEffect(policy, direction) {
        // Om direction är 1, använd de ursprungliga effekterna
        // Om direction är -1, använd inverterade effekter

        let youngEffect = policy.effectYoung * direction;
        let oldEffect = policy.effectOld * direction;

        // Tillämpa effekterna och begränsa värdena mellan 0 och 100
        this.youngSatisfaction = Phaser.Math.Clamp(this.youngSatisfaction + youngEffect, 0, 100);
        this.oldSatisfaction = Phaser.Math.Clamp(this.oldSatisfaction + oldEffect, 0, 100);

        // Uppdatera sliders och text
        this.youngText.setText(`Unga nöjdhet: ${this.youngSatisfaction}`);
        this.oldText.setText(`Äldre nöjdhet: ${this.oldSatisfaction}`);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scene: eHealthGame,
    parent: 'game-container'
};

const game = new Phaser.Game(config);
