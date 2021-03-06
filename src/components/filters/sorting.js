import { create_coverage_map } from './filter_utils'

export function sort_by_coverage_X(current_state, all_data) {
    const edges = current_state.edges;

    let x = current_state.x;
    let y = current_state.y;

    let x_map = create_coverage_map(edges, (e) => e.get_x(), (e) => e.get_y())

    function sort_array(list, map){
        return list.sort((e1, e2) => {
            const id1 = e1.get_id();
            const id2 = e2.get_id();

            const size1 = map.has(id1) ? map.get(id1).size : 0;
            const size2 = map.has(id2) ? map.get(id2).size : 0;

            return size1 < size2
        })
    }

    return {
        "edges": edges,
        "x": sort_array(x, x_map),
        "y": y,
    }
}

export function sort_by_coverage_Y(current_state, all_data) {
    const edges = current_state.edges;

    let x = current_state.x;
    let y = current_state.y;

    let y_map = create_coverage_map(edges, (e) => e.get_y(), (e) => e.get_x())

    function sort_array(list, map) {
        return list.sort((e1, e2) => {
            const id1 = e1.get_id();
            const id2 = e2.get_id();

            const size1 = map.has(id1) ? map.get(id1).size : 0;
            const size2 = map.has(id2) ? map.get(id2).size : 0;

            return size1 < size2
        })
    }

    return {
        "edges": edges,
        "x": x,
        "y": sort_array(y, y_map),
    }
}


export function sort_by_cluster_X(current_state, all_data) {
    let x = current_state.x;
    const y = current_state.y;
    const edges = current_state.edges;

    return {
        x: x.sort((e1, e2) => e1.get_cluster() < e2.get_cluster()),
        y: y,
        edges: edges,
    }
}

export function sort_by_cluster_Y(current_state, all_data) {
    const x = current_state.x;
    let y = current_state.y;
    const edges = current_state.edges;

    return {
        x: x,
        y: y.sort((e1, e2) => e1.get_cluster() < e2.get_cluster()),
        edges: edges,
    }
}

export function sort_by_suspciousness(current_state, all_data) {
    let x = current_state.x;
    let y = current_state.y;
    const edges = current_state.edges;

    // Create Maps One method id to test id and one test id to test result
    let x_map = create_coverage_map(edges, (e) => e.method_id, (e) => e.test_id)
    let test_result_map = new Map()

    // Create a map of testing results 'test_id' --> result
    edges.forEach(edge => {
        const id = edge.test_id;
        const result = edge.test_result === "P";

        test_result_map.set(id, result)
    });

    // Compute the number tests passed/failed.
    let total_tests_failed = 0;
    let total_tests_passed = 0;

    test_result_map.forEach((value, key) => {
        if (value) {
            total_tests_passed += 1;
        } else {
            total_tests_failed += 1;
        }
    });

    // Tarantula Suspciousness calculation
    function suspiciousness(method) {
        let passed = 0;
        let failed = 0;

        if (!x_map.has(method.get_id())) {
            return -1;
        }

        let tests = x_map.get(method.get_id())

        // Compute passed/failed testcases
        tests.forEach((test_id) => {
            if (test_result_map.has(test_id) && test_result_map.get(test_id)) {
                passed += 1;
            } else {
                failed += 1;
            }
        });

        return (failed / total_tests_failed) / ((passed/total_tests_passed) + (failed/total_tests_failed))
    }

    // Sort based on suspiciosness of each test
    function sort_array(list) {
        return list.sort((e1, e2) => {
            return suspiciousness(e1) < suspiciousness(e2);
        })
    }

    // If all tests fail or all tests pass don't compute suspciousness score, because it will fail.
    if (total_tests_failed !== 0 && total_tests_passed !== 0) {
        x = sort_array(x);
    }

    return {
        "edges": edges,
        "x": x,
        "y": y,
    }
}