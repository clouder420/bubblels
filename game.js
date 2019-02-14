class Game{

    constructor(){
        this.canvas_size = new Point(window.innerWidth, window.innerHeight);
        this.app = new PIXI.Application(this.canvas_size.x,
                                        this.canvas_size.y,
                                        { transparent: true });
        document.body.appendChild(this.app.view);
        this.graphics= new PIXI.Graphics();
        this.app.stage.addChild(this.graphics);
        this.unit = Math.min(window.innerWidth, window.innerHeight) / 100;
        this.score_text = new PIXI.Text('', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: '#FF3562',
            align: 'left'
        });
        this.score_text.position.set(20);
        this.app.stage.addChild(this.score_text);

        this.best_score = 0;
        this.color = 0xA74482;
        this.new_game();
        this.app.ticker.add(delta => this.animation_step(delta));
    }

    new_game(){
        this.position = new Point(window.innerWidth / 2,
                                  window.innerHeight / 2);
        this.enemies = [];
        this.time = 0;
        this.score = 0;
        this.prev = -1;
        this.radius = 5*this.unit;
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
        this.enemies.push(new Enemy(new Point(p.x, p.y),
                                    new Point(v*d.x, v*d.y),
                                    (1+5*Math.random())*this.unit));
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
    }

    animation_step(delta){
        this.update(delta);
        this.graphics.clear();
        this.draw_circle(this.position, this.radius, this.color);
        this.enemies.forEach(e => this.draw_circle(e.position,
                                                   e.radius,
                                                   e.color))
    }

    draw_circle(p, r, color){
        this.graphics.lineStyle(0);
        this.graphics.beginFill(color);
        this.graphics.drawCircle(p.x,
                                 p.y,
                                 r);
        this.graphics.endFill();
    }

}

class Enemy {
    constructor(position, velocity, radius){
        this.position = position;
        this.velocity = velocity;
        this.acceleration = new Point(0, 0);
        this.radius = radius;
        this.extra_displacement = 2;
        this.inside = false;
        this.color = 0xF84AA7;
    }

    mass(){
        return (this.radius)**2;
    }

    update(delta){
        if(this.inside){
            this.acceleration.add(new Point(delta*(Math.random()-0.5) / 50,
                                            delta*(Math.random()-0.5) / 50));
            this.velocity.add(this.acceleration);
        }
        this.position.add(new Point(this.velocity.x * delta,
                                    this.velocity.y * delta));
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
