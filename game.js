window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};


class Game{

    constructor(){
        this.canvas_size = new Point(window.innerWidth, window.innerHeight);
        this.app = new PIXI.Application(this.canvas_size.x,
                                        this.canvas_size.y,
                                        { transparent: true });
        document.body.appendChild(this.app.view);
        this.graphics= new PIXI.Graphics();
        this.graphics.alpha = 0.8;
        this.unit = Math.min(window.innerWidth, window.innerHeight) / 100;
        this.score_text = new PIXI.Text('', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: '#FF3562',
            align: 'left'
        });
        this.score_text.position.set(20);
        this.app.stage.addChild(this.score_text);

        this.bubble_container = new PIXI.Container();
        this.best_score = 0;
        this.color = 0xA74482;
        this.container = new PIXI.particles.ParticleContainer(5000, {
            scale: true,
            position: true,
            rotation: false,
            uvs: false,
            tint: true
        });


        this.app.stage.addChild(this.container);
        this.app.stage.addChild(this.bubble_container);
        this.new_game();
        this.app.ticker.add(delta => this.animation_step(delta));
    }

    new_game(){
        while(this.bubble_container.children[0]) {
            this.bubble_container.removeChild(this.bubble_container.children[0]);
        }
        this.position = new Point(window.innerWidth / 2,
                                  window.innerHeight / 2);
        this.enemies = [];
        this.time = 0;
        this.score = 0;
        this.prev = -1;
        this.radius = 5*this.unit;
        this.sprite = this.draw_circle(this.radius,
                                       this.color);
        this.sprite.anchor.set(0.5);
        this.bubble_container.addChild(this.sprite);
        this.spawn_enemy();
    }

    setPosition(p){
        this.position.set(p);
    }

    spawn_enemy(){
        var theta = 2 * Math.PI * Math.random();
        var M = Math.max(this.canvas_size.x, this.canvas_size.y);
        var C = new Point(this.canvas_size.x / 2,
                          this.canvas_size.y / 2);
        var p = new Point((M + 100) * Math.cos(theta) + C.x,
                          -(M + 100) * Math.sin(theta) + C.y);
        var tmp = new Point( (C.x - p.x) / 100,
                             (C.y - p.y) / 100);
        var d = new Point(tmp.x / tmp.distance(new Point(0, 0)),
                          tmp.y / tmp.distance(new Point(0, 0)));
        var v = (2 * Math.random() + 0.5)*this.unit;
        var r = (1+5*Math.random())*this.unit;
        var sprite = this.draw_circle(r, 0xF84AA7);
        sprite.anchor.set(0.5);
        var config = {
            alpha: {
                start: 0.8,
                end: 0
            },
            scale: {
                start: 0.1,
                end: 0.1,
                minimumScaleMultiplier: 1
            },
            color: {
                start: '#ffffff',
                end: '#247cff'
            },
            speed: {
                start: 50*v,
                end: 0,
                minimumSpeedMultiplier: 1.02
            },
            acceleration: {
                x: 0,
                y: 0
            },
            maxSpeed: 0,
            startRotation: {
                min: 360,
                max: 1080
            },
            noRotation: false,
            rotationSpeed: {
                min: 0,
                max: 0
            },
            lifetime: {
                min: 0.01,
                max: 3/v
            },
            blendMode: 'add',
            frequency: 0.001,
            emitterLifetime: -1,
            maxParticles: 300,
            pos: {
                x: 0,
                y: 0
            },
            addAtBack: false,
            spawnType: 'circle',
            spawnCircle: {
                x: 0,
                y: 0,
                r: r+20
            }
        }

        var emitter = new PIXI.particles.Emitter(this.bubble_container,
                                                 [PIXI.Texture.fromImage('https://pixijs.io/pixi-particles-editor/assets/images/particle.png')],
                                                 config);

        this.bubble_container.addChild(sprite);
        this.enemies.push(new Enemy(new Point(p.x, p.y),
                                    new Point(v*d.x, v*d.y),
                                    r,
                                    sprite,
                                    emitter));
    }

    update(delta){
        this.time += delta;
        this.score += Math.floor(delta * this.enemies.length);
        this.score_text.text = `score:\t${this.score}\nbest:\t${this.best_score}`;
        if(Math.floor(this.time / 100) > this.prev){
            this.prev = Math.floor(this.time / 100);
            this.spawn_enemy();
        }
        this.enemies.forEach(e => e.update(delta));
        for(i in this.enemies){
            var e = this.enemies[i];
            if(e.position.distance(this.position) <= this.radius + e.radius){
                this.best_score = Math.max(this.best_score, this.score);
                this.new_game();
                break;
            }
        }
        this.enemies.forEach(e => e.check_inside(this.canvas_size));
        this.enemies.forEach(e => e.reflect(this.canvas_size));
        var n = this.enemies.length;
        for(var i = 1; i < n; i++){
            for(var j = 0; j < i; j++){
                this.enemies[i].collide_with(this.enemies[j]);
            }
        }
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
    }

    animation_step(delta){
        this.update(delta);
    }

    draw_circle(r, color){
        this.graphics.clear();
        this.graphics.lineStyle(0);
        this.graphics.beginFill(color);
        this.graphics.drawCircle(0, 0, r);
        this.graphics.endFill();
        return new PIXI.Sprite(this.app.renderer
                               .generateTexture(this.graphics));
    }

}

class Enemy {
    constructor(position, velocity, radius, sprite, emitter){
        this.position = position;
        this.velocity = velocity;
        this.acceleration = new Point(0, 0);
        this.radius = radius;
        this.extra_displacement = 2;
        this.inside = false;
        this.color = 0xF84AA7;
        this.sprite = sprite;
        this.emitter = emitter;
    }

    mass(){
        return (this.radius)**2;
    }

    update(delta){
        if(this.inside){
            if(!window.mobilecheck()){
                this.emitter.updateOwnerPos(this.position.x, this.position.y);
                this.emitter.update(delta / 100);
            }

            this.acceleration.add(new Point(delta*(Math.random()-0.5) / 50,
                                            delta*(Math.random()-0.5) / 50));
            this.velocity.add(this.acceleration);
        }
        this.position.add(new Point(this.velocity.x * delta,
                                    this.velocity.y * delta));
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
    }

    reflect(bounds){
        if(this.inside){

            if(this.position.x - this.radius <= 0){
                var new_pos = new Point(this.radius + this.extra_displacement,
                                        this.position.y);
                var new_vel = new Point(-this.velocity.x,
                                        this.velocity.y);
                this.position.set(new_pos);
                this.velocity.set(new_vel);
            }

            if(this.position.x + this.radius >= bounds.x){
                var new_pos = new Point(bounds.x -
                                        this.radius -
                                        this.extra_displacement,
                                        this.position.y);
                var new_vel = new Point(-this.velocity.x,
                                        this.velocity.y);
                this.position.set(new_pos);
                this.velocity.set(new_vel);
            }

            if(this.position.y - this.radius <= 0){
                var new_pos = new Point(this.position.x,
                                        this.radius + this.extra_displacement);
                var new_vel = new Point(this.velocity.x,
                                        -this.velocity.y);
                this.position.set(new_pos);
                this.velocity.set(new_vel);
            }

            if(this.position.y + this.radius >= bounds.y){
                var new_pos = new Point(this.position.x,
                                        bounds.y -
                                        this.radius -
                                        this.extra_displacement);
                var new_vel = new Point(this.velocity.x,
                                        -this.velocity.y);
                this.position.set(new_pos);
                this.velocity.set(new_vel);
            }
        }
    }

    overlaps(other_enemy){
        return this.position.distance(other_enemy.position) <= this.radius +
            other_enemy.radius;
    }

    velocity_after_collision(other_enemy){
        var v1 = this.velocity;
        var m1 = this.mass();
        var x1 = this.position;
        var v2 = other_enemy.velocity;
        var m2 = other_enemy.mass();
        var x2 = other_enemy.position;

        var A = 0.01 * 2 * m2 / (m1 + m2) *
            (new Point(v1.x - v2.x, v1.y - v2.y))
            .dot(new Point(x1.x - x2.x, x1.y - x2.y)) /
            (new Point(x1.x - x2.x, x1.y - x2.y)).distance(new Point(0, 0));

        var x = v1.x - A * (x1.x - x2.x);
        var y = v1.y - A * (x1.y - x2.y);

        return new Point(x, y);
    }

    collide_with(other_enemy){
        if(this.overlaps(other_enemy)){
            var v1 = this.velocity_after_collision(other_enemy);
            var v2 = other_enemy.velocity_after_collision(this);
            this.velocity.set(v1);
            other_enemy.velocity.set(v2);
        }
    }

    check_inside(s){
        if(this.position.x - this.radius >= 0 &&
           this.position.x + this.radius <= s.x &&
           this.position.y - this.radius >= 0 &&
           this.position.y + this.radius <= s.y){
            this.inside = true;
        }
    }
}

class Point {
    constructor(x, y){
        this.x = Number(x)
        this.y = Number(y)
    }

    add(p){
        this.x += p.x;
        this.y += p.y;
    }

    set(p){
        this.x = p.x;
        this.y = p.y;
    }

    distance(p){
        return Math.sqrt((this.x - p.x)**2 + (this.y - p.y)**2)
    }

    dot(p){
        return this.x * p.x + this.y * p.y;
    }
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return new Point(evt.clientX - rect.left, evt.clientY - rect.top)
};


game = new Game();

$(document).on("mousemove", function(evt){
    var canvas = $("canvas")[0];
    game.setPosition(getMousePos(canvas, evt));
})

$("canvas").on("touchmove", function(evt){
    var rect = $(this)[0].getBoundingClientRect();
    var pos = new Point(evt.touches[0].pageX-rect.left,
                        evt.touches[0].pageY-rect.top);
    if(game.position.distance(pos) <= 50){
        game.setPosition(pos);
    }
})
