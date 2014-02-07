function Traveler() {
  
  this.init = function(graph, start_pid) {
    this.points = {};
    this.plan = [start_pid];
    this.current_pid = start_pid;
    this.back_index = 0;

    this.init_points(graph.points);
    this.init_connections(graph.arcs);
  }

  this.init_points = function(g_points) {
    var point;
    for (var i = 0; i < g_points.length; i++) {
      point = g_points[i]
      this.points[point.id] = new Point(point.id, point.x, point.y);
    }
  }

  this.init_connections = function(g_arcs) {
    var arc;
    for (var i = 0; i < g_arcs.length; i++) {
      arc = g_arcs[i];
      this.points[arc[0]].add_connection_pid(arc[1]);
      this.points[arc[1]].add_connection_pid(arc[0]);
    }
  }

  this.update_back_index = function(next_pid) {
    if (next_pid == this.prev_pid()) {
      if (this.back_index > 0) {
        this.back_index -= 1;
      }
    } else {
      this.back_index = this.plan.length - 2;
    }
  }

  this.map_points_from = function(pids) {
    var result = [];

    for (var i = 0; i < pids.length; i++) {
      result.push(this.points[pids[i]])
    }
    return result;
  }

  this.update_current_pid = function(pid) {
    this.current_pid = pid;
  }

}

Traveler.prototype.log_visit = function(pid) {
  this.update_back_index(pid);
  this.update_current_pid(pid);
  this.points[pid].update_count();
}

Traveler.prototype.unvisited = function(pids) {
  var points_arr = this.map_points_from(pids);
  var result = [];

  for (var i = 0; i < points_arr.length; i++) {
    if (points_arr[i].visit_count == 0) {
      result.push(points_arr[i]);
    }
  }
  return result;
}

Traveler.prototype.prev_pid = function() {
  if (this.back_index < 0) {
    return null
  } else {
    return this.plan[this.back_index];
  }
}

Traveler.prototype.pick_pid_by_connections = function(points_arr) {
  var next_pid = null;
  var min_dist = null;

  for (var i = 0; i < points_arr.length; i++) {
    var pointA = points_arr[i];
    var connections = this.unvisited(pointA.connection_pids);

    if (connections.length > 0) {
      var pid = this.closest(pointA.pid, connections);
      var pointB = this.points[pid];
      var dist = this.measure_distance(pointA, pointB);

      if ((min_dist == null) || (dist < min_dist)) {
        min_dist = dist;
        next_pid = pointA.pid;
      }
    }
  }
  
  return next_pid;
}

Traveler.prototype.pick_pid_unvisited = function(points_arr) {
  return this.closest(this.current_pid, points_arr);
}

Traveler.prototype.closest = function(pid, points_arr) {
  var pointA = this.points[pid];
  var pointB = points_arr[0];
  var closest = pointB.pid;
  var min_dist = this.measure_distance(pointA, pointB);

  for(var i = 0; i < points_arr.length; i++) {
    pointB = points_arr[i];
    var dist = this.measure_distance(pointA, pointB);
    if (dist < min_dist) {
      closest = pointB.pid;
      min_dist = dist;
    }
  }
  return closest;
}

Traveler.prototype.measure_distance = function(pointA, pointB) {
  var delta_x = Math.abs(pointA.x - pointB.x);
  var delta_y = Math.abs(pointA.y - pointB.y);
  var dist = Math.sqrt(Math.pow(delta_x, 2) + Math.pow(delta_y, 2));

  return dist;
}


Traveler.prototype.move = function(pids) {
  var unvisited = this.unvisited(pids);
  var next_pid = null;

  if (unvisited.length > 0) {
    next_pid = this.pick_pid_unvisited(unvisited);
  } else {
    var points_arr = this.map_points_from(pids);
    next_pid = this.pick_pid_by_connections(points_arr);
  }

  this.walk(next_pid);
}

Traveler.prototype.go_home = function() {
  var start_pid = this.plan[0];
  var end_pid = this.current_pid;
  var point = this.points[end_pid];
  var home_connections = this.points[start_pid].connection_pids;
  var searching = true

  while (searching) {
    for(var i = 0; i < home_connections.length; i++) {
      if (point.connection_pids.indexOf(home_connections[i]) > -1) {
        this.walk(home_connections[i]);
        this.walk(start_pid);
        searching = false;
        break;
      }
    }
    if (searching) {
      this.walk_backwards();
      point = this.points[this.current_pid];
    }
  }
}

Traveler.prototype.walk = function(next_pid) {
  if (next_pid == null) {
    this.walk_backwards();
  } else {
    this.plan.push(next_pid);
    this.log_visit(next_pid);
  }
}

Traveler.prototype.walk_backwards = function() {
  var prev_pid = this.prev_pid();
  this.plan.push(prev_pid);
  this.log_visit(prev_pid);
}

Traveler.prototype.compute_plan = function(graph, start_pid) {
  this.init(graph, start_pid);

  var traveler = this;

  var remaining = Object.keys(traveler.points);
  var current_point = traveler.points[start_pid];
  var prev_pid = -1;
  var pids;

  while (remaining.length > 0) {
    pids = current_point.connection_pids;

    traveler.move(pids);

    if (remaining.indexOf(traveler.current_pid) > -1) {
      remaining.splice(remaining.indexOf(traveler.current_pid), 1);
    }
    current_point = traveler.points[traveler.current_pid];
  }
  console.log("All Points Visited. Now to go home...");
  traveler.go_home();
  return traveler.plan;
}


function Point(pid, x, y) {
  var my_point = this;

  my_point.pid = pid;
  my_point.x = x;
  my_point.y = y;
  my_point.connection_pids = [];
  my_point.visit_count = 0;

  this.add_connection_pid = function(pid) {
    if (my_point.connection_pids.indexOf(pid) < 0) {
      my_point.connection_pids.push(pid);
    }
  }

  this.update_count = function() {
    my_point.visit_count += 1;
  }

}